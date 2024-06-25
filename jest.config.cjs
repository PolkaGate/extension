// Copyright 2019-2024 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = require('@polkadot/dev/config/jest.cjs');
// config.transformIgnorePatterns= ["/!node_modules\@mangata-finance"]
config.transformIgnorePatterns= ["/!node_modules\@vaadin"]

module.exports = {
  // transformIgnorePatterns: ['/!node_modules'],
  ...config,
  moduleNameMapper: {
    '@polkadot/extension-(base|chains|compat-metamask|dapp|inject|mocks|ui)(.*)$': '<rootDir>/packages/extension-$1/src/$2',
    // eslint-disable-next-line sort-keys
    '@polkadot/extension(.*)$': '<rootDir>/packages/extension/src/$1',
    '\\.(css|less)$': 'empty/object',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/packages/extension-mocks/src/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest/setupEnv.js'],
  testEnvironment: 'jsdom'
};
