// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { BN } from '@polkadot/util';
import type { Proxy, TxResult } from '../types';

import { signAndSend } from './';

export async function createPool(
  api: ApiPromise,
  depositor: string | null,
  signer: KeyringPair,
  value: BN,
  poolId: number,
  roles: {
    root?: string;
    nominator?: string;
    bouncer?: string;
  },
  poolName: string,
  proxy?: Proxy
): Promise<TxResult> {
  try {
    if (!depositor) {
      console.log('createPool:  _depositor is empty!');

      return { success: false };
    }

    const created = api.tx['utility']['batch']([
      api.tx['nominationPools']['create'](value, roles.root, roles.nominator, roles.bouncer),
      api.tx['nominationPools']['setMetadata'](poolId, poolName)
    ]);

    const tx = proxy ? api.tx['proxy']['proxy'](depositor, proxy.proxyType, created) : created;

    return signAndSend(api, tx, signer, depositor);
  } catch (error) {
    console.log('Something went wrong while createPool', error);

    return { success: false };
  }
}