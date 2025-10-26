// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

export enum STEPS {
  // steps used in loading page
  ASK_TO_SET_PASSWORD,
  MAYBE_LATER,
  NO_LOGIN,
  SHOW_LOGIN,
  IN_NO_LOGIN_PERIOD,
  SHOW_DELETE_ACCOUNT_CONFIRMATION,
  // steps used in password management page
  NO_PASSWORD,
  ALREADY_SET_PASSWORD,
  NEW_PASSWORD_SET,
  PASSWORD_REMOVED,
  ERROR,
  SHOW_DELETE_ACCOUNT_CONFIRMATION_FS
}
