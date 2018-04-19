const functions = require('firebase-functions');
const admin = require('firebase-admin');
const plivo = require('plivo');

const config = functions.config();

admin.initializeApp();

const { db_paths, result, is_phone_number } = require('./src-common');

const cors = require('cors')({ origin: 'https://azathayastan.online' });

const INITIAL_TEXT = `Welcome to my direct line, you will get news and updates from this number --Nikol Pashinyan 🇦🇲 `;

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
  // alphaIDs will not work when sending to US numbers
  return client.messages
    .create(our_message_sender, dest_phone_number, message)
    .then(register_result.bind(null, dest_phone_number))
    .catch(register_error.bind(null, dest_phone_number));
};

const send_to_all_subscription_based = (client, message) => {
  return admin
    .database()
    .ref(`/${db_paths.subscription_based_signups}/user-data`)
    .once('value')
    .then(snap_shot => snap_shot.val())
    .then(rows => {
      if (rows !== null) {
        for (const row of Object.values(rows)) {
          const { phone_number: dest_phone_number } = row;
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
        return response.end(JSON.stringify({ result: result.success, payload: 'Mass texted' }));
      })
    )
    .catch(register_error);
});

const persist_new_user = ({ phone_number }) => {
  return admin
    .database()
    .ref(db_paths.subscription_based_signups)
    .push()
    .then(reply => {
      const updates = {};
      updates[`/${db_paths.subscription_based_signups}/accounts/${phone_number}`] = {
        post_key: reply.key,
      };
      updates[`/${db_paths.subscription_based_signups}/user-data/${reply.key}`] = {
        phone_number,
        creation_time: new Date().getTime(),
        post_key: reply.key,
      };
      return admin
        .database()
        .ref()
        .update(updates);
    });
};

// const reply_to_new_signup = (src_phone_number, dest_phone_number, request, response) =>
//   new Promise(resolve => {
//     const p_response = new plivo.Response();
//     p_response.addMessage('Thank you for signing up, we will send you news and updates', {
//       src: src_phone_number,
//       dst: dest_phone_number,
//     });
//     return resolve(
//       cors(request, response, () => {
//         const msg = p_response.toXML();
//         response.setHeader('content-type', 'application/xml');
//         response.send(msg);
//       })
//     );
//   });

const check_if_user_already_exists = phone_number =>
  admin
    .database()
    .ref(`/${db_paths.subscription_based_signups}/accounts/${phone_number}`)
    .once('value')
    .then(snap_shot => snap_shot.val())
    .then(user => ({ user_already_exists: user !== null, user }));

// Directly from a text message to us
// exports.subscribe_from_text_message = functions.https.onRequest((request, response) => {
//   const { From: from_number, To: to_number, Text: text } = request.body;
// });

const is_bad_phone_number_candidate = phone_number =>
  !phone_number ||
  typeof phone_number !== 'string' ||
  !is_phone_number(phone_number) ||
  !phone_number.startsWith('+374');

const send_failure = (response, reason) =>
  response.send(JSON.stringify({ result: 'failure', reason }));

// From the site sign up, with the cors middleware, important to never do .end
exports.subscribe = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    const { phone_number } = request.body;
    const is_not_well_formatted = is_bad_phone_number_candidate(phone_number);
    if (is_not_well_formatted) {
      response.send(
        JSON.stringify({ result: 'failure', reason: 'Only Armenian numbers accepted' })
      );
      throw new Error(`Non Armenian mobile phone provided`);
    }
    return check_if_user_already_exists(phone_number)
      .then(({ user_already_exists, user }) => {
        if (user_already_exists) {
          send_failure(response, 'Հեռախոսահամարը արդեն գրանցված է');
          throw new Error(`${phone_number} already had account`);
        } else {
          return persist_new_user({ phone_number });
        }
      })
      .then(() => {
        const { auth_id, auth_token } = config.plivo;
        const client = new plivo.Client(auth_id, auth_token);
        return send_message({ client, dest_phone_number: phone_number, message: INITIAL_TEXT });
      })
      .then(() => response.send(JSON.stringify({ result: 'success' })))
      .catch(error => {
        console.error(`${error.message}`);
      });
  });
});
