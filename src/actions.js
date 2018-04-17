import { project_name_dev, plivo_details } from './src-common';
import { __DEV__, __APPLICATION__SECRETS__ } from './constants';

const { send_mass_text, send_mass_text_local } = __APPLICATION__SECRETS__.actions;

const headers = new Headers({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

export const do_send_mass_text = (dest_message, russian_or_american) => {
  return fetch(__DEV__ ? send_mass_text_local : send_mass_text, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      dest_message,
      russian_or_american,
      is_mass_text: true,
      direct_person: null,
    }),
  }).then(r => r.json());
};

export const do_send_direct_to_person = (dest_message, direct_person) => {
  return fetch(__DEV__ ? send_mass_text_local : send_mass_text, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      dest_message,
      russian_or_american: 'american',
      is_mass_text: false,
      direct_person,
    }),
  }).then(r => r.json());
};
