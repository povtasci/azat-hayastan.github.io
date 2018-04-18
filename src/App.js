import React from 'react';
import * as firebase from 'firebase';

import styles from './App.module.css';
import { do_send_mass_text, do_send_direct_to_person } from './actions';
import { __DEV__, __APPLICATION__SECRETS__ } from './constants';
import { is_phone_number } from './src-common';
import LoginForm from './login-form';

class ProfileControl extends React.Component {
  render() {
    return <p>hi</p>;
  }
}

class App extends React.Component {
  state = { error: null, authenticated: null };

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

  do_login = e => {
    console.log('foo bar');
  };

  on_submit_signin = async ({ signin_phone_number, signin_password }) => {
    return;
  };

  on_submit_signup = async ({ signup_phone_number, signup_password }) => {
    return;
  };

  render() {
    const { error, authenticated } = this.state;
    return (
      <div className={styles.ApplicationContainer}>
        <div>
          <h3 className={styles.ApplicationContainer__Banner}>
            <p>
              Այստեղ բաժանորդագրվելով Դուք կստանաք SMS հաղորդագրություններ` շարժման հետ կապված բոլոր
              կարևոր իրադարձությունների մասին։
            </p>
          </h3>
          {error ? <p className={styles.ErrorMessage}>Something wrong: {error.message}</p> : null}
          {authenticated === null ? (
            <LoginForm
              on_submit_signup={this.on_submit_signup}
              on_submit_signin={this.on_submit_signin}
            />
          ) : (
            <ProfileControl />
          )}
        </div>
      </div>
    );
  }
}

export default App;
