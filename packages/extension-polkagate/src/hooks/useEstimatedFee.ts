// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple, ISubmittableResult } from '@polkadot/types/types';

import { useEffect, useState } from 'react';

import { BN_ONE } from '@polkadot/util';

import { useInfo } from '.';

export default function useEstimatedFee(address: string | undefined, call?: SubmittableExtrinsicFunction<'promise', AnyTuple> | SubmittableExtrinsic<'promise', ISubmittableResult>, params?: unknown[] | (() => unknown)[]): Balance | undefined {
  const { api } = useInfo(address);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  useEffect(() => {
    if (!address || !call) {
      return;
    }

    const isFunction = typeof call === 'function';

    if (isFunction && !params) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE) as Balance);
    }

    const _call = isFunction ? call(...params || []) : call;

    _call.paymentInfo(address)
      .then(
        (i) => setEstimatedFee(i?.partialFee && api.createType('Balance', i.partialFee) as Balance)
      ).catch(console.error);
  }, [address, api, call, params]);

  return estimatedFee;
}
