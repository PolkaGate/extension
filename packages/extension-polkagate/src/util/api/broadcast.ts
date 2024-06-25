// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/* eslint-disable header/header */

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId } from '@polkadot/types/interfaces';

import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

import { Proxy, TxResult } from '../types';
import { signAndSend } from './signAndSend';

export default async function broadcast(
  api: ApiPromise,
  extrinsic: ((...args: any[]) => SubmittableExtrinsic<'promise'>),
  params: unknown[] | (() => unknown[]),
  signer: KeyringPair,
  senderAddress: string | AccountId,
  proxy?: Proxy
): Promise<TxResult> {
  try {
    console.log(`Broadcasting a ${proxy ? 'proxy ' : ''}tx ....`);

    const tx = proxy ? api.tx['proxy']['proxy'](senderAddress, proxy.proxyType, extrinsic(...params)) : extrinsic(...params);

    return signAndSend(api, tx, signer, proxy?.delegate ?? senderAddress);
  } catch (e) {
    console.log('something went wrong while broadcasting', e);

    return { success: false };
  }
}
