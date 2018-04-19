import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button, Label } from 'react-bootstrap';
import IntlTelInput from 'react-bootstrap-intl-tel-input';
import ReCAPTCHA from 'react-google-recaptcha';

import { is_phone_number } from '../src-common';
import styles from './signup-entry.module.css';
import { RECAPTCHA_SITE_KEY } from '../constants';

const SPACER_15_H = <div style={{ height: '15px', width: '100%' }} />;

const SHARE_YOUR_THOUGHTS_LIMIT = 3000;

const INIT_STATE = {
  error: null,
  signup_phone_number: '',
  captcha_satisfied: false,
};

export default class FormEntry extends React.Component {
  state = { ...INIT_STATE };

  on_submit = e => {
    e.preventDefault();
    const { signup_phone_number, share_your_thoughts, captcha_satisfied } = this.state;
    const { on_submit_signup } = this.props;
    const is_valid_phone_number = is_phone_number(signup_phone_number);
    if (is_valid_phone_number === false || captcha_satisfied === false) {
      this.setState(() => ({ error: new Error(`Phone number or password is not valid`) }));
    } else {
      on_submit_signup({ signup_phone_number });
    }
  };

  set_phone_number = ({ intlPhoneNumber }) =>
    this.setState({ signup_phone_number: intlPhoneNumber });

  recaptcha_changed = data => data !== null && this.setState(() => ({ captcha_satisfied: true }));

  render() {
    const { error } = this.state;
    return (
      <form onSubmit={this.on_submit}>
        <FormGroup bsSize={'large'}>
          <h2>
            <Label bsSize={'large'}>Հեռախոսահամար</Label>
          </h2>
          <IntlTelInput
            preferredCountries={['AM', 'RU']}
            defaultCountry={'AM'}
            onChange={this.set_phone_number}
          />
          {SPACER_15_H}
          <div className={styles.ReCAPTCHA__Wrapper}>
            <ReCAPTCHA
              ref="recaptcha"
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={this.recaptcha_changed}
            />
          </div>
          {SPACER_15_H}
          <Button block={true} bsSize={'large'} bsStyle={'primary'} type={'submit'}>
            Գրանցվել
          </Button>
        </FormGroup>
      </form>
    );
  }
}
