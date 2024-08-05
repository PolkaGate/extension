// Copyright 2019-2024 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

const ALLOWED_PATH = ['/', '/account/import-ledger', '/account/restore-json', '/onboarding'] as const;
// Added for Polkagate
const START_WITH_PATH = [
  '/account/',
  '/accountfs/',
  '/import/',
  '/governance/',
  '/manageIdentity/',
  '/send/',
  '/stake/',
  '/socialRecovery/',
  '/derivefs/'
] as const;

const EXTENSION_PREFIX = 'POLKAGATE';

const PORT_PREFIX = `${EXTENSION_PREFIX || 'unknown'}-${process.env['PORT_PREFIX'] || 'unknown'}`;
const PORT_CONTENT = `${PORT_PREFIX}-content`;
const PORT_EXTENSION = `${PORT_PREFIX}-extension`;

const MESSAGE_ORIGIN_PAGE = `${PORT_PREFIX}-page`;
const MESSAGE_ORIGIN_CONTENT = `${PORT_PREFIX}-content`;

const PASSWORD_EXPIRY_MIN = 15;
const PASSWORD_EXPIRY_MS = PASSWORD_EXPIRY_MIN * 60 * 1000;

const PHISHING_PAGE_REDIRECT = '/phishing-page-detected';

export {
  ALLOWED_PATH,
  PASSWORD_EXPIRY_MIN,
  PASSWORD_EXPIRY_MS,
  PHISHING_PAGE_REDIRECT,
  EXTENSION_PREFIX,
  PORT_CONTENT,
  PORT_EXTENSION,
  START_WITH_PATH, // Added for Polkagate
  MESSAGE_ORIGIN_PAGE,
  MESSAGE_ORIGIN_CONTENT
};
