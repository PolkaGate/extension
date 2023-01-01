// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { getValue } from '../popup/account/util';
import { useBalances } from '.';

export default function useCanPayFee(formatted: AccountId | string | undefined, estimatedFee: Balance | undefined): boolean | undefined {
  const balances = useBalances(formatted);
  const [canPayFee, setCanPayFee] = useState<boolean | undefined>();

  useEffect(() =>
    balances && estimatedFee && setCanPayFee(getValue('available', balances)?.gt(estimatedFee)), [balances, estimatedFee]);

  return canPayFee;
}
