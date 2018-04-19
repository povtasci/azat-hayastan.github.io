import { project_name_dev, plivo_details } from './src-common';
import { __DEV__, __APPLICATION__SECRETS__ } from './constants';

const {
  send_mass_text,
  send_mass_text_local,
  subscribe,
  subscribe_local,
} = __APPLICATION__SECRETS__.actions;

const headers = new Headers({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

export const do_subscribe_new_number = ({ phone_number }) =>
  fetch(__DEV__ ? subscribe_local : subscribe, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone_number }),
  }).then(r => r.json());

export const do_send_mass_text = dest_message => {
  return fetch(__DEV__ ? send_mass_text_local : send_mass_text, {
    method: 'POST',
    headers,
    body: JSON.stringify({ dest_message }),
  }).then(r => r.json());
};

export const do_send_direct_to_person = (dest_message, direct_person) => {
  return fetch(__DEV__ ? send_mass_text_local : send_mass_text, {
    method: 'POST',
    headers,
    body: JSON.stringify({ dest_message, direct_person }),
  }).then(r => r.json());
};
