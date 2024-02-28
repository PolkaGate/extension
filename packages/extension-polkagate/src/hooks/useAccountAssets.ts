// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { AccountsAssetsContext } from '../components';
import { TEST_NETS } from '../util/constants';
import { AccountAssets } from '../util/types';
import useIsTestnetEnabled from './useIsTestnetEnabled';

export default function useAccountAssets (address: string | undefined): AccountAssets[] | undefined | null {
  const [accountAssets, setAccountAssets] = useState<AccountAssets[] | undefined | null>();
  const { accountsAssets } = useContext(AccountsAssetsContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  useEffect(() => {
    if (!address || !accountsAssets) {
      return;
    }

    /** Filter testnets if they are disabled */
    const assets = accountsAssets.balances.find((balance) => balance.address === address)?.assets;
    const filteredAssets = isTestnetEnabled === false ? assets?.filter(({ genesisHash }) => !TEST_NETS.includes(genesisHash)) : assets;

    setAccountAssets(filteredAssets && filteredAssets.length > 0 ? filteredAssets : filteredAssets && filteredAssets.length === 0 ? null : undefined);
  }, [accountsAssets, address, isTestnetEnabled]);

  return accountAssets;
}
