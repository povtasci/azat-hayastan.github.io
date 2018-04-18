import React from 'react';

import styles from './login-form.module.css';

const SPACER_15_H = <div style={{ height: '15px', width: '100%' }} />;

export const TABS = { signup: 'signup', signin: 'signin' };

export default class FormEntry extends React.Component {
  state = {
    error: null,
    signin_or_signup: TABS.signup,
    signin_phone_number: '',
    signin_password: '',
    signup_phone_number: '',
    signup_password: '',
  };

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

  make_signup_form() {
    return (
      <form onSubmit={this.on_submit.bind(this, TABS.signup)}>
        <fieldset className={styles.FieldsetContainer}>
          <section className={styles.FlexRow}>
            <label>Phone number: </label>
            <input
              onChange={e => this.setState({ signup_phone_number: e.target.value })}
              value={this.state.signup_phone_number}
              type={'text'}
              placeholder={'(+374)'}
            />
          </section>
          {SPACER_15_H}
          <section className={styles.FlexRow}>
            <label>Password: </label>
            <input
              onChange={e => this.setState({ signup_password: e.target.value })}
              value={this.state.signup_password}
              type={'password'}
              placeholder={'password'}
            />
          </section>
          {SPACER_15_H}
          {SPACER_15_H}
          <div>
            <input
              type={'submit'}
              className={styles.FieldsetContainer__ActionButton}
              value={'Sign up'}
            />
          </div>
        </fieldset>
      </form>
    );
  }

  on_submit = async (tab, e) => {
    e.preventDefault();
    const { on_submit_signin, on_submit_signup } = this.props;
    const {
      signin_phone_number,
      signin_password,
      signup_phone_number,
      signup_password,
    } = this.state;

    if (tab === TABS.signin) {
      const result = await on_submit_signin({ signin_phone_number, signin_password });
    } else if (tab === TABS.signup) {
      const result = await on_submit_signup({ signup_phone_number, signup_password });
    }
  };

  make_signin_form() {
    return (
      <form onSubmit={this.on_submit.bind(this, TABS.signin)}>
        <fieldset className={styles.FieldsetContainer}>
          <section className={styles.FlexRow}>
            <label>Phone number: </label>
            <input
              onChange={e => this.setState({ signin_phone_number: e.target.value })}
              value={this.state.signin_phone_number}
              type={'text'}
              placeholder={'your phone number (+374)'}
            />
          </section>
          {SPACER_15_H}
          <section className={styles.FlexRow}>
            <label>Password: </label>
            <input
              onChange={e => this.setState({ signin_password: e.target.value })}
              value={this.state.signin_password}
              type={'password'}
              placeholder={'password'}
            />
          </section>
          {SPACER_15_H}
          <div>
            <input
              className={styles.FieldsetContainer__ActionButton}
              type={'submit'}
              value={'Sign in'}
            />
          </div>
        </fieldset>
      </form>
    );
  }

  set_sign_in = () => {
    this.setState(() => ({ signin_or_signup: TABS.signin }));
  };

  set_sign_up = () => {
    this.setState(() => ({ signin_or_signup: TABS.signup }));
  };

  render() {
    const { signin_or_signup } = this.state;
    return (
      <div>
        <section className={styles.Fieldsetcontainer__ActionTabRow}>
          <input
            className={`${
              signin_or_signup === TABS.signup
                ? `FieldsetContainerPrompt ${styles['FieldsetContainer__Signin--Selected']}`
                : 'FieldsetContainerPrompt'
            }`}
            type={'button'}
            onClick={this.set_sign_up}
            value={'Sign up for news'}
          />
          <input
            className={`${
              signin_or_signup === TABS.signin
                ? styles['FieldsetContainer__Signin--Selected']
                : 'FieldsetContainerPrompt'
            }`}
            type={'button'}
            onClick={this.set_sign_in}
            value={'Sign in to change preference'}
          />
        </section>
        {this.make_content()}
      </div>
    );
  }
}
