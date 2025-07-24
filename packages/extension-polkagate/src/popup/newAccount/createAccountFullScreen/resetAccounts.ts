// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getStorage, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { NAMES_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

import { forgetAccount } from '../../../messaging';
import { LOGIN_STATUS, type LoginInfo } from '../../passwordManagement/types';

export const resetOnForgotPassword = async () => {
  const info = await getStorage(NAMES_IN_STORAGE.LOGIN_IFO) as LoginInfo;

  if (info?.status === LOGIN_STATUS.FORGOT && info?.addressesToForget) {
    return await resetAccounts(info.addressesToForget);
  }

  return true;
};

const resetAccounts = async (addresses: string[]): Promise<boolean> => {
  try {
    await updateStorage(NAMES_IN_STORAGE.LOGIN_IFO, { status: 'reset' });

    // Map and execute forgetAccount for each address
    const promises = addresses.map((address) => forgetAccount(address));
    const results = await Promise.all(promises);

    if (results.every((element) => element === true)) {
      return true;
    } else {
      throw new Error('forgetAccount promises failed');
    }
  } catch (e) {
    console.error(e);

    return false;
  }
};
