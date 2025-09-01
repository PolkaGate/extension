// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { useEffect, useState } from 'react';

import { getValue } from '../popup/account/util';
import { useBalances2 } from '.';

export default function useCanPayFee (formatted: string | undefined, genesisHash: string | undefined, estimatedFee: Balance | BN | undefined): boolean | undefined {
  const balances = useBalances2(formatted, genesisHash);
  const [canPayFee, setCanPayFee] = useState<boolean | undefined>();

  useEffect(() =>
    balances && estimatedFee && setCanPayFee(getValue('transferable', balances)?.gt(estimatedFee))
    , [balances, estimatedFee]);

  return canPayFee;
}
