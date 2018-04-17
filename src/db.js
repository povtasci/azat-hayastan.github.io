import * as firebase from 'firebase';
import { __DEV__ } from './constants';

let config = null;

if (__DEV__) {
  config = {
    apiKey: 'AIzaSyDRlixD4hcGFPp5crdFMT09OSQnBT9GN7g',
    authDomain: 'azat-hayastan-dev.firebaseapp.com',
    databaseURL: 'https://azat-hayastan-dev.firebaseio.com',
    projectId: 'azat-hayastan-dev',
    storageBucket: 'azat-hayastan-dev.appspot.com',
    messagingSenderId: '1037144820020',
  };
} else if (__DEV__ === false) {
  config = {};
} else {
  console.error(`Unknown value for __DEV__:${__DEV__}`);
}

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
