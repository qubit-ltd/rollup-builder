////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

import config from '@qubit-ltd/eslint-config';

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        URL: 'readonly',
      },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        Document: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLHtmlElement: 'readonly',
        HTMLCollection: 'readonly',
        Window: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'max-classes-per-file': 'off',
    },
  },
];
