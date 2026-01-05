// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
// @ts-ignore
import type { PalletStakingStakingLedger } from '@polkadot/types/lookup';

import { useEffect, useState } from 'react';

import useChainInfo from './useChainInfo';
import useFormatted from './useFormatted';

export default function useStashId (address: AccountId | string | undefined, genesisHash: string | undefined): AccountId | string | undefined {
  const formatted = useFormatted(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const [stashId, setStashId] = useState<AccountId | string>();

  useEffect(() => {
    try {
      if (!api || !api.query?.['staking']?.['ledger'] || !formatted) {
        return;
      }

      api.query['staking']['ledger'](formatted)
        .then((res) => {
          const response = res.isEmpty ? undefined : res.toPrimitive() as unknown as PalletStakingStakingLedger;

          setStashId(response?.stash?.toString() ?? formatted);
        })
        .catch(console.error);
    } catch (e) {
      setStashId(undefined);
      console.error(e);
    }
  }, [api, formatted]);

  return stashId;
}
