import React from 'react';
import { FormGroup, Button, Label } from 'react-bootstrap';
import IntlTelInput from 'react-bootstrap-intl-tel-input';
import ReCAPTCHA from 'react-google-recaptcha';

import { is_phone_number } from '../src-common';
import styles from './signup-entry.module.css';
import { RECAPTCHA_SITE_KEY } from '../constants';

const SPACER_15_H = <div style={{ height: '15px', width: '100%' }} />;

const INIT_STATE = {
  error: null,
  signup_phone_number: '',
  captcha_satisfied: false,
};

export default class FormEntry extends React.Component {
  state = { ...INIT_STATE };

  on_submit = e => {
    e.preventDefault();
    const { signup_phone_number, captcha_satisfied } = this.state;
    const { on_submit_signup } = this.props;
    const is_valid_phone_number = is_phone_number(signup_phone_number);
    if (is_valid_phone_number === false || captcha_satisfied === false) {
      this.setState(() => ({
        error: new Error(`Phone number not entered or captcha not checked`),
      }));
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
          <div class="intl-phone-input">
          <div class="input-group">
          <div class="input-group-btn">
          <button type="button" tabindex="0" aria-hidden="true" class="btn btn-secondary btn-primary dropdown-toggle country-selector" >
          <img class="flag-icon" src="/static/media/AM.da7c8fce.svg" alt="AM" />
          </button>
          </div>
          <label for="dd440b01-7d27-481f-bd54-444476b99af1" aria-hidden="true" class="sr-only">
          Please enter your country{"'"}s calling code followed by your phone number
          </label>
          <input autocomplete="off" aria-describedby="validation-info" type="text" class="form-control phone-input" placeholder="" value="" />
          </div>
          </div>
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
