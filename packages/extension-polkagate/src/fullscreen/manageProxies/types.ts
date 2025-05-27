// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TRANSACTION_FLOW_STEPS } from '@polkadot/extension-polkagate/src/util/constants';

export const STEPS = {
  ...TRANSACTION_FLOW_STEPS,
  ADD_PROXY: 'add_proxy',
  CHECK: 'check',
  MANAGE: 'manage',
  // PROXY: 100,
  SIGN_QR: 'sign_QR',
  UNSUPPORTED: 'unsupported'
}