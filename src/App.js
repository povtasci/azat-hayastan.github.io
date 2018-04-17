import React from 'react';

import styles from './App.module.css';
import { do_send_mass_text } from './actions';
import { __DEV__, __APPLICATION__SECRETS__ } from './constants';

class App extends React.Component {
  componentDidMount() {
    console.log(__APPLICATION__SECRETS__);
  }

  send_mass_text = async () => {
    const r = await do_send_mass_text('Hey man, did this text work? -Edgar');
    console.log({ r });
  };

  render() {
    return (
      <div className={styles.ApplicationContainer}>
        <p>{__DEV__}</p>
        <input type={'button'} value={'Test Cloud'} onClick={this.send_mass_text} />
      </div>
    );
  }
}

export default App;
