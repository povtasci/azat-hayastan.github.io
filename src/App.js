import React from 'react';
import * as firebase from 'firebase';
import { Jumbotron, Tabs, Tab } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Switch } from 'react-router';

import styles from './App.module.css';
import { do_send_mass_text, do_send_direct_to_person, do_subscribe_new_number } from './actions';
import { __DEV__, __APPLICATION__SECRETS__ } from './constants';
import { is_phone_number } from './src-common';
import SignupNewNumber from './components/signup-entry';

class ProfileControl extends React.Component {
  render() {
    return <p>hi</p>;
  }
}

const TABS = { signup: 'signup', signin: 'signin' };

const LOADING_STATE = {
  NOT_STARTED_YET: 'not-started-yet',
  DID_LOAD: 'did-load',
  CURRENTLY_LOADING: 'currently-loading',
};

const INIT_STATE = {
  error: null,
  authenticated_user: null,
  loading_state: LOADING_STATE.NOT_STARTED_YET,
  // loading_state: LOADING_STATE.CURRENTLY_LOADING,
};

export default class AzatHayastanApplication extends React.Component {
  state = { ...INIT_STATE };

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

  on_submit_signin = async ({ signin_phone_number, signin_password }) => {
    return;
  };

  on_submit_signup = ({ signup_phone_number, signup_password, user_thoughts }) => {
    this.setState(
      () => ({ loading_state: LOADING_STATE.CURRENTLY_LOADING }),
      async () => {
        const { result, reason, payload } = await do_subscribe_new_number({
          phone_number: signup_phone_number,
          password: signup_password,
          optional_thoughts_given: user_thoughts,
        });
        if (result === 'success') {
          this.setState(() => ({ authenticated_user: true }));
        } else if (result === 'failure') {
          this.setState(() => ({ error: new Error(`Error: because: ${reason}`) }));
        } else {
          // Not possible
        }
        console.log({ result, reason, payload });
      }
    );
  };

  render() {
    const { error, authenticated_user, loading_state } = this.state;
    const maybe_error = error ? (
      <p className={styles.ErrorMessage}>Something wrong: {error.message}</p>
    ) : null;

    console.log({ loading_state });
    const signup_content =
      loading_state === LOADING_STATE.CURRENTLY_LOADING ? (
        <div className={styles.ApplicationContainer__SpinnerContainer}>
          <Spinner fadeIn={'quarter'} name={'ball-scale-ripple-multiple'} />
        </div>
      ) : (
        <SignupNewNumber on_submit_signup={this.on_submit_signup} />
      );

    return (
      <Router>
        <>
          <Switch>
            <Route
              exact={true}
              path={'/admin'}
              render={props => {
                return <p>some admin page</p>;
              }}
            />
            <Route
              path="/"
              render={props => {
                return (
                  <main className={styles.ApplicationContainer}>
                    <Jumbotron>
                      <h3 className={styles.ApplicationContainer__Banner}>
                        Ստացեք SMS հաղորդագրություններ` շարժման կարևոր իրադարձությունների մասին
                      </h3>
                    </Jumbotron>
                    {signup_content}
                  </main>
                );
              }}
            />
          </Switch>
        </>
      </Router>
    );
  }
}
