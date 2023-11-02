// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getStorage, LoginInfo, updateStorage } from '../../components/Loading';
import { forgetAccount } from '../../messaging';

export const resetOnForgotPassword = async () => {
  const info = await getStorage('loginInfo') as LoginInfo;

  if (info?.status === 'forgot' && info?.addressesToForget) {
    return await resetAccounts(info.addressesToForget);
  }

  return true;
};

const resetAccounts = async (addresses: string[]): Promise<boolean> => {
  try {
    await updateStorage('loginInfo', { status: 'reset' });

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
