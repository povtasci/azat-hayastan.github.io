import React from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
import IntlTelInput from 'react-bootstrap-intl-tel-input';

import styles from './signup-entry.module.css';

const SPACER_15_H = <div style={{ height: '15px', width: '100%' }} />;

const INIT_STATE = {
  error: null,
  signup_phone_number: '',
  signup_password: '',
};

export default class FormEntry extends React.Component {
  state = { ...INIT_STATE };

  on_submit = async e => {
    e.preventDefault();
    const { on_submit_signup } = this.props;
    const { signup_phone_number, signup_password } = this.state;
    const did_try_submit = await on_submit_signup({ signup_phone_number, signup_password });
    const { result, payload, reason } = did_try_submit;
    if (result === 'failure') {
      this.setState(() => ({ error: new Error(`Failure: ${reason}`) }));
    } else if (result === 'success') {
      // Some congrats message
    } else {
      // Not possible
    }
  };

  validation_state() {
    return null;
  }
  set_phone_number = ({ intlPhoneNumber }) =>
    this.setState({
      signup_phone_number: intlPhoneNumber,
    });

  render() {
    return (
      <form onSubmit={this.test_submit}>
        <FormGroup bsSize={'medium'} validationState={this.validation_state()}>
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
          <HelpBlock>Password must be at least six characters</HelpBlock>
          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Optional Message</ControlLabel>
            <FormControl componentClass="textarea" placeholder={'share your thoughts'} />
          </FormGroup>
          <Button block={true} bsSize={'large'} bsStyle={'primary'} type={'submit'}>
            Subscribe
          </Button>
        </FormGroup>
      </form>
    );
  }
}
