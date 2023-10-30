// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getStorage, LoginInfo, updateStorage } from '../../components/Loading';
import { forgetAccount } from '../../messaging';

export const resetAccounts = async (): Promise<boolean> => {
  try {
    const info = await getStorage('loginInfo') as LoginInfo;

    await updateStorage('loginInfo', { status: 'reset' });

    // Map and execute forgetAccount for each address
    const promises = info.addressesToForget?.map((address) => forgetAccount(address));
    const results = await Promise.all(promises);

    if (results.every((element) => element === true)) {
      return true;
    } else {
      console.error('forgetAccount promises failed');

      return false;
    }
  } catch (e) {
    console.error(e);

    return false;
  }
};
