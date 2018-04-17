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

const send_message = ({ client, dest_phone_number, message }) => {
  const { our_message_sender } = config.phone_numbers;
  return client.messages
    .create(our_message_sender, dest_phone_number, message)
    .then(register_result.bind(null, dest_phone_number))
    .catch(register_error.bind(null, dest_phone_number));
};

const send_to_all_subscription_based = (client, message) => {
  return admin
    .database()
    .ref(db_paths.subscription_based_signups)
    .once('value')
    .then(snap_shot => snap_shot.val())
    .then(rows => {
      if (rows !== null) {
        for (const row of rows) {
          const { dest_phone_number } = row;
          send_message({ client, dest_phone_number, message });
        }
        return rows.length;
      } else return 0;
    });
};

exports.send_mass_text = functions.https.onRequest((request, response) => {
  const { auth_id, auth_token } = config.plivo;
  const client = new plivo.Client(auth_id, auth_token);
  const { dest_message } = request.body;
  return send_to_all_subscription_based(client, dest_message)
    .then(() =>
      cors(request, response, () => {
        response.send(JSON.stringify({ result: result.success, payload: 'Hello from Firebase!' }));
      })
    )
    .catch(error =>
      cors(request, response, () => {
        response.send(
          JSON.stringify({ result: result.failure, reason: `Reason: ${error.message}` })
        );
      })
    );
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
