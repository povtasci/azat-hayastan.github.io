import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
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
  signup_password: '',
  share_your_thoughts: '',
  captcha_satisfied: false,
};

export default class FormEntry extends React.Component {
  state = { ...INIT_STATE };

  on_submit = e => {
    e.preventDefault();
    const {
      signup_phone_number,
      signup_password,
      share_your_thoughts,
      captcha_satisfied,
    } = this.state;
    const { on_submit_signup } = this.props;
    const is_valid_phone_number = is_phone_number(signup_phone_number);
    const signup_password_more_than_five = signup_password.length >= 5;
    const user_thoughts = share_your_thoughts.slice(0, SHARE_YOUR_THOUGHTS_LIMIT);
    if (
      is_valid_phone_number === false ||
      signup_password_more_than_five === false ||
      captcha_satisfied === false
    ) {
      this.setState(() => ({ error: new Error(`Phone number or password is not valid`) }));
    } else {
      on_submit_signup({ signup_phone_number, signup_password, user_thoughts });
    }
  };

  validation_state() {
    return null;
  }

  set_phone_number = ({ intlPhoneNumber }) =>
    this.setState({
      signup_phone_number: intlPhoneNumber,
    });

  recaptcha_changed = data => data !== null && this.setState(() => ({ captcha_satisfied: true }));

  render() {
    const { error } = this.state;
    return (
      <form onSubmit={this.on_submit}>
        <FormGroup bsSize={'large'} validationState={this.validation_state()}>
          <ControlLabel>Phone Number</ControlLabel>
          <IntlTelInput
            preferredCountries={['AM', 'RU']}
            defaultCountry={'AM'}
            onChange={this.set_phone_number}
          />
          {SPACER_15_H}
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type={'password'}
            value={this.state.signup_password}
            placeholder={'Do not lose this password'}
            onChange={e => this.setState({ signup_password: e.target.value })}
          />
          <FormControl.Feedback />
          <HelpBlock>Password must be at least five characters</HelpBlock>
          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Optional Message</ControlLabel>
            <FormControl
              value={this.state.share_your_thoughts}
              componentClass={'textarea'}
              onChange={e => this.setState({ share_your_thoughts: e.target.value })}
              placeholder={'share your thoughts'}
            />
          </FormGroup>
          <ReCAPTCHA
            ref="recaptcha"
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={this.recaptcha_changed}
          />,
          <Button block={true} bsSize={'large'} bsStyle={'primary'} type={'submit'}>
            Subscribe
          </Button>
        </FormGroup>
      </form>
    );
  }
}
