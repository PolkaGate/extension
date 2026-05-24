// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getStorage, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { forgetAccount } from '../../../messaging';
import { type ForgottenInfo } from '../../passwordManagement/types';

export const resetOnForgotPassword = async () => {
  const info = await getStorage(STORAGE_KEY.IS_FORGOTTEN) as ForgottenInfo;

  if (info?.status && info?.addressesToForget) {
    return await resetAccounts(info.addressesToForget);
  }

  return true;
};

const resetAccounts = async (addresses: string[]): Promise<boolean> => {
  try {
    await updateStorage(STORAGE_KEY.IS_FORGOTTEN, { status: false });

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
