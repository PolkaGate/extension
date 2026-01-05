// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { useMemo } from 'react';

import { getValue } from '../popup/account/util';
import useBalances from './useBalances';

export default function useCanPayFee (formatted: string | undefined, genesisHash: string | undefined, estimatedFee: Balance | BN | undefined | null): boolean | undefined {
  const balances = useBalances(formatted, genesisHash);

  return useMemo(() => {
    if (balances && estimatedFee) {
      return getValue('transferable', balances)?.gt(estimatedFee);
    }

    return undefined;
  }
    , [balances, estimatedFee]);
}
