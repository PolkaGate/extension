// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple } from '@polkadot/types/types';

import { useEffect, useState } from 'react';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { BN_ONE } from '@polkadot/util';

import { useInfo } from '.';

export default function useEstimatedFee(address: string | undefined, call?: SubmittableExtrinsicFunction<'promise', AnyTuple>, params?: unknown[] | (() => unknown)[]): Balance | undefined {
  const { api } = useInfo(address);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  useEffect(() => {
    if (!address || !call || !params) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    call(...params)
      .paymentInfo(address)
      .then(
        (i) => setEstimatedFee(i?.partialFee && api.createType('Balance', i.partialFee)))
      .catch(console.error);
  }, [address, api, call, params]);

  return estimatedFee;
}
