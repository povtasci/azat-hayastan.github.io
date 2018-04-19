import React from 'react';
import * as firebase from 'firebase';
import { Panel, FormGroup, ControlLabel, Table, FormControl, Button } from 'react-bootstrap';

import styles from './admin-panel.module.css';

const CONTENT = { LOGIN: 'login-content', ADMINTABLE: 'admin-table-content' };

const INIT_STATE = {
  error: null,
  content: CONTENT.LOGIN,
  mass_message_to_send: '',
  total_sms_user_count: null,
};

export default class Admin extends React.Component {
  state = { ...INIT_STATE };

  total_sms_user_count = () =>
    firebase
      .database()
      .ref('total-registered-sms-users')
      .once('value')
      .then(snap_shot => Number(snap_shot.val()));

  do_signin = async e => {
    e.preventDefault();
    const { email_username, password } = this.state;
    if (email_username !== '' && password !== '') {
      const result = await firebase.auth().signInWithEmailAndPassword(email_username, password);
      const total_sms_user_count = await this.total_sms_user_count();
      this.setState(() => ({ content: CONTENT.ADMINTABLE, total_sms_user_count }));
    } else {
      this.setState(() => ({ error: new Error('Either password or username is empty') }));
    }
  };

  make_content = () => {
    const { content, email_username, password } = this.state;
    switch (content) {
      case CONTENT.LOGIN:
        return (
          <form onSubmit={this.do_signin}>
            <FormGroup>
              <ControlLabel>username (your email account)</ControlLabel>
              <FormControl
                type="text"
                onChange={e => this.setState({ email_username: e.target.value })}
                placeholder="email"
                value={email_username}
              />
              <ControlLabel>password</ControlLabel>
              <FormControl
                type="password"
                onChange={e => this.setState({ password: e.target.value })}
                placeholder="password"
                value={password}
              />
              <Button type="submit">Submit</Button>
            </FormGroup>
          </form>
        );
      case CONTENT.ADMINTABLE:
        return (
          <Table striped bordered condensed hover>
            <thead>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </thead>
          </Table>
        );
      default:
        throw new Error('Not possible');
    }
  };

  render() {
    const { error } = this.state;
    const content = this.make_content();
    return (
      <div className={styles.AdminPanelContainer}>
        <Panel bsStyle="primary">
          <Panel.Heading bsSize={'large'}>
            {error !== null ? (
              <p className={styles.ErrorMessage}>Error: {error.message}</p>
            ) : (
              'Sign in'
            )}
          </Panel.Heading>
          <Panel.Body>{content}</Panel.Body>
        </Panel>
        <Panel bsStyle="primary">
          <Panel.Heading bsSize={'large'}>
            {error !== null ? (
              <p className={styles.ErrorMessage}>Error: {error.message}</p>
            ) : (
              'Sign up for account'
            )}
          </Panel.Heading>
          <Panel.Body>{content}</Panel.Body>
        </Panel>
      </div>
    );
  }
}
