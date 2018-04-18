import React from 'react';

import styles from './login-form.module.css';

const SPACER_15_H = <div style={{ height: '15px', width: '100%' }} />;

export const TABS = { signup: 'signup', signin: 'signin' };

export default class FormEntry extends React.Component {
  state = { error: null, signin_or_signup: TABS.signin };

  make_content = () => {
    const { signin_or_signup } = this.state;
    switch (signin_or_signup) {
      case TABS.signup:
        return this.make_signup_form();
      case TABS.signin:
        return this.make_signin_form();
      default:
        throw new Error(`Unknown content asked: ${signin_or_signup}`);
    }
  };

  make_signup_form = () => {
    return <p>hi</p>;
  };

  on_submit = e => {
    e.preventDefault();
    const { on_submit } = this.props;
    const { value: user_name } = this._user_name;
    const { value: password } = this._password;
    on_submit({ user_name, password });
  };

  make_signin_form() {
    return (
      <form onSubmit={this.on_submit}>
        <fieldset className={styles.FieldsetContainer}>
          <section className={styles.FlexRow}>
            <label>Username: </label>
            <input
              ref={r => (this._user_name = r)}
              type={'text'}
              value={''}
              placeholder={'user name'}
            />
          </section>
          {SPACER_15_H}
          <section className={styles.FlexRow}>
            <label>Password: </label>
            <input type={'password'} ref={r => (this._password = r)} placeholder={'password'} />
          </section>
          {SPACER_15_H}
          <div>
            <input type={'submit'} value={'Sign in'} />
          </div>
        </fieldset>
      </form>
    );
  }
  set_sign_in = () => {
    console.log('set sign in ');
  };
  render() {
    const { signin_or_signup } = this.state;
    return (
      <div>
        <section>
          <input
            className={`${
              signin_or_signup === TABS.signin ? styles['FieldsetContainer__Signin--Selected'] : ''
            }`}
            type={'button'}
            onClick={this.set_sign_in}
            value={'Sign in to change preference'}
          />
          <input type={'button'} value={'Sign up for news'} />
        </section>
        {this.make_content()}
      </div>
    );
  }
}
