const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const plivo = require('plivo');

admin.initializeApp();

const config = functions.config();

const { db_paths, result, plivo_details } = require('./src-common');

const register_error = (dest_phone_number, error) =>
  new Promise(resolve => {
    return resolve();
  });

const register_result = (dest_phone_number, message_created) =>
  new Promise(resolve => {
    return resolve();
  });

const send_message = ({ client, dest_phone_number, message, russian_or_american }) => {
  const { our_message_sender, our_subscription_receiver } = config.phone_numbers;
  const number =
    (russian_or_american === 'russian' && our_subscription_receiver) ||
    (russian_or_american === 'american' && our_message_sender);
  return client.messages
    .create(number, dest_phone_number, message)
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

const persist_new_user = ({ from_number, to_number, text }) => {
  const is_valid = is_valid_signup_message(text);
  if (is_valid_signup_message === false)
    throw new Error(
      `Invalid response: ${JSON.stringify({
        from_number,
        text,
      })}`
    );
  else {
    return admin
      .database()
      .ref(db_paths.subscription_based_signups)
      .push()
      .then(reply => {
        const updates = {};
        updates[`/${db_paths.subscription_based_signups}/${from_number}`] = {
          from_number,
          to_number,
          received_from_user_text: text,
        };
        return admin
          .database()
          .ref()
          .update(updates);
      });
  }
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

exports.subscribe = functions.https.onRequest((request, response) => {
  const { From: from_number, To: to_number, Text: text } = request.body;
  return persist_new_user({ from_number, to_number, text })
    .then(register_result)
    .then(() => reply_to_new_signup(to_number, from_number, request, response))
    .then(() => {
      return cors(request, response, () => response.end());
    })
    .catch(register_error);
});
