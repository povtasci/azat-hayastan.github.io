import React from 'react';
import * as firebase from 'firebase';

import styles from './App.module.css';
import { do_send_mass_text, do_send_direct_to_person } from './actions';
import { __DEV__, __APPLICATION__SECRETS__ } from './constants';
import { is_phone_number } from './src-common';
import LoginForm from './login-form';

class App extends React.Component {
  state = { error: null };

  send_mass_text = async () => {
    const { value } = this._phone_number_input;
    const phone_number = value.trim();
    const is_number = is_phone_number(phone_number);
    if (is_number) {
      const { value } = this._message_input;
      const msg = value.trim();
      const r = await do_send_direct_to_person(msg, phone_number);
    } else {
      this.setState(() => ({ error: new Error(`Your input was not a phone number`) }));
    }
  };
  // <input type={'text'} ref={r => (this._phone_number_input = r)} />
  // <input type={'text'} ref={r => (this._message_input = r)} />
  // <input type={'button'} value={'Test Cloud'} onClick={this.send_mass_text} />

  do_login = e => {
    e.preventDefault();
    console.log('foo bar');
  };

  render() {
    const { error } = this.state;
    return (
      <div className={styles.ApplicationContainer}>
        <div>
          <h3 className={styles.ApplicationContainer__Banner}>Login to control your messages</h3>
          {error ? <p className={styles.ErrorMessage}>Something wrong: {error.message}</p> : null}
          <LoginForm on_submit={this.do_login} />
        </div>
      </div>
    );
  }
}

export default App;
