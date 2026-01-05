// Copyright 2017-2026 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import baseConfig from '@polkadot/dev/config/eslint';

export default [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/indent': 'off',
      'import/extensions': 'off',
      'react/jsx-max-props-per-line': 'off',
    }
  }
];
