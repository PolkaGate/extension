// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { useEffect, useState } from 'react';

import { getValue } from '../popup/account/util';
import { useBalances } from '.';

export default function useCanPayFee(formatted: string | undefined, estimatedFee: Balance | BN | undefined): boolean | undefined {
  const balances = useBalances(formatted);
  const [canPayFee, setCanPayFee] = useState<boolean | undefined>();

  useEffect(() =>
    balances && estimatedFee && setCanPayFee(getValue('available', balances)?.gt(estimatedFee))
    , [balances, estimatedFee]);

  return canPayFee;
}
