// Copyright 2019-2024 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const base = require('@polkadot/dev/config/eslint.cjs');

module.exports = {
  ...base,
  ignorePatterns: [
    ...base.ignorePatterns,
    'jest/**/*',
    'i18next-scanner.config.js'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ...base.parserOptions,
    project: [
      './tsconfig.eslint.json'
    ]
  },
  plugins: ['@typescript-eslint'],
  rules: {
    ...base.rules,
    // this seems very broken atm, false positives
    '@typescript-eslint/unbound-method': 'off',
    "parser": "@typescript-eslint/parser",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "warn"
  }
};
