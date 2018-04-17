import React from 'react';
import __APPLICATION__SECRETS__ from './runtimeconfig.json';

let __DEV__ = null;
if (process.env.NODE_ENV === 'development') __DEV__ = true;
else if (process.env.NODE_ENV === 'production') __DEV__ = false;

export { __DEV__, __APPLICATION__SECRETS__ };
