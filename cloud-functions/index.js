const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const plivo = require('plivo');
const bcrypt = require('bcrypt');
const { formatNumber, parseNumber } = require('libphonenumber-js');

admin.initializeApp();

const config = functions.config();

const { db_paths, result, is_phone_number } = require('./src-common');

const register_error = (dest_phone_number, error) =>
  new Promise(resolve => {
    return resolve();
  });

const register_result = (dest_phone_number, message_created) =>
  new Promise(resolve => {
    return resolve();
  });

const send_message = ({ client, dest_phone_number, message }) => {
  const { our_message_sender } = config.phone_numbers;
  return client.messages
    .create(our_message_sender, dest_phone_number, message)
    .then(register_result.bind(null, dest_phone_number))
    .catch(register_error.bind(null, dest_phone_number));
};

const send_to_all_subscription_based = (client, message, russian_or_american) => {
  return admin
    .database()
    .ref(db_paths.subscription_based_signups)
    .once('value')
    .then(snap_shot => snap_shot.val())
    .then(rows => {
      if (rows !== null) {
        for (const row of rows) {
          const { dest_phone_number } = row;
          send_message({ client, dest_phone_number, message, russian_or_american });
        }
        return rows.length;
      } else return 0;
    });
};

const on_error = (request, response, error) =>
  cors(request, response, () => {
    response.end(JSON.stringify({ result: result.failure, reason: `Reason: ${error.message}` }));
  });

exports.send_mass_text = functions.https.onRequest((request, response) => {
  const { auth_id, auth_token } = config.plivo;
  const client = new plivo.Client(auth_id, auth_token);
  const { dest_message, russian_or_american, is_mass_text, direct_person } = request.body;
  if (is_mass_text) {
    return send_to_all_subscription_based(client, dest_message, russian_or_american)
      .then(() =>
        cors(request, response, () => {
          return response.end(JSON.stringify({ result: result.success, payload: 'Mass texted' }));
        })
      )
      .catch(on_error.bind(null, request, response));
  } else {
    return send_message({
      client,
      dest_phone_number: direct_person,
      message: dest_message,
      russian_or_american,
    })
      .then(() => {
        return cors(request, response, () => {
          return response.end(
            JSON.stringify({ result: result.success, payload: 'Did send message to direct person' })
          );
        });
      })
      .catch(on_error.bind(null, request, response));
  }
});

const is_valid_signup_message = text => {
  return true;
};

const persist_new_user = ({ phone_number, password, optional_thoughts_given }) => {
  return admin
    .database()
    .ref(db_paths.subscription_based_signups)
    .push()
    .then(reply => {
      const updates = {};
      updates[`/${db_paths.subscription_based_signups}/${phone_number}`] = {
        phone_number,
        optional_thoughts_given,
        post_key: reply.key,
      };
      return admin
        .database()
        .ref()
        .update(updates);
    });
};

const reply_to_new_signup = (src_phone_number, dest_phone_number, request, response) =>
  new Promise(resolve => {
    const p_response = new plivo.Response();
    p_response.addMessage('Thank you for signing up, we will send you news and updates', {
      src: src_phone_number,
      dst: dest_phone_number,
    });
    return resolve(
      cors(request, response, () => {
        const msg = p_response.toXML();
        response.setHeader('content-type', 'application/xml');
        response.send(msg);
      })
    );
  });

const check_if_user_already_exists = phone_number =>
  admin
    .database()
    .ref(`/${db_paths.subscription_based_signups}/${phone_number}`)
    .once('value')
    .then(snap_shot => snap_shot.val())
    .then(user => ({ user_already_exists: user !== null, user }));

// Directly from a text message to us
exports.subscribe_from_text_message = functions.https.onRequest((request, response) => {
  const { From: from_number, To: to_number, Text: text } = request.body;
});

const validate_site_subscription = ({ phone_number, password }) =>
  !phone_number ||
  !password ||
  typeof phone_number !== 'string' ||
  !is_phone_number(phone_number) ||
  password === '';

const fail_with_cors = (because, user_already_exists, req, res) =>
  new Promise((resolve, reject) => {
    cors(req, res, () => {
      res.end(JSON.stringify({ result: 'failure', reason: because }));
      reject(new Error(`Failure: ${JSON.stringify({ because, user_already_exists })}`));
    });
  });

const plain_success_with_cors = (req, res) =>
  cors(req, res, () => res.end(JSON.stringify({ result: 'success' })));

// From the site sign up
exports.subscribe = functions.https.onRequest((request, response) => {
  const {
    phone_number: unformatted_phone_number,
    password,
    optional_thoughts_given,
  } = request.body;
  if (validate_site_subscription({ phone_number: unformatted_phone_number, password })) {
    return fail_with_cors('bad input parameters', request, response);
  }
  const phone_number = formatNumber(parseNumber(unformatted_phone_number), 'International');
  return check_if_user_already_exists(phone_number)
    .then(({ user_already_exists, user }) => {
      if (user_already_exists) {
        return fail_with_cors('User aready exists', user_already_exists, request, response);
      } else {
        return persist_new_user({ phone_number, password, optional_thoughts_given });
      }
    })
    .then(() => {
      const { auth_id, auth_token } = config.plivo;
      const client = new plivo.Client(auth_id, auth_token);
      return send_message({
        client,
        dest_phone_number: phone_number,
        message: 'Thank you for joining',
      });
    })
    .then(() => plain_success_with_cors(request, response))
    .catch(register_error);
});
