// Copyright 2017-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import baseConfig from '@polkadot/dev/config/eslint';

export default [
  ...baseConfig,
  {
    rules: {
      'import/extensions': 'off',
      'react/jsx-max-props-per-line': 'off',
    }
  }
];
