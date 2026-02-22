// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const LOGIN_STATUS = {
  FORGOT: 'forgot',
  JUST_SET: 'justSet',
  MAYBE_LATER: 'mayBeLater',
  NO_LOGIN: 'noLogin',
  RESET: 'reset',
  SET: 'set'
};

type LoginStatus = typeof LOGIN_STATUS[keyof typeof LOGIN_STATUS];

export interface LoginInfo {
  status: LoginStatus;
  lastLoginTime?: number;
  lastEdit?: number;
  hashedPassword?: string;
  addressesToForget?: string[];
}

export interface ForgottenInfo {
  status: boolean | undefined;
  addressesToForget?: string[];
}
