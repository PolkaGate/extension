// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple, ISubmittableResult } from '@polkadot/types/types';

import { useEffect, useState } from 'react';

import { BN_ONE } from '@polkadot/util';

import useChainInfo from './useChainInfo';

export default function useEstimatedFee (genesisHash: string | undefined, address: string | undefined, call?: SubmittableExtrinsicFunction<'promise', AnyTuple> | SubmittableExtrinsic<'promise', ISubmittableResult>, params?: unknown[] | (() => unknown)[]): Balance | undefined | null {
  const { api } = useChainInfo(genesisHash);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  useEffect(() => {
    if (estimatedFee || !address || !call) {
      return;
    }

    const isFunction = typeof call === 'function';

    if (isFunction && !params) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      setEstimatedFee(api?.createType('Balance', BN_ONE) as unknown as Balance);

      return;
    }

    (async () => {
      try {
        const _call = isFunction ? call(...params || []) : call;
        const i = await _call.paymentInfo(address);

        setEstimatedFee(i?.partialFee && api.createType('Balance', i.partialFee) as unknown as Balance);
      } catch (e) {
        console.error('something went wrong while estimating fee:', e);
      }
    })().catch(console.error);
  }, [address, api, call, params, estimatedFee]);

  return api === null
    ? null
    : estimatedFee;
}
