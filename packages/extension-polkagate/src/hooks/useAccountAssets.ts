// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { AccountsAssetsContext } from '../components';
import { TEST_NETS } from '../util/constants';
import { FetchedBalance } from './useAssetsOnChains2';
import useIsTestnetEnabled from './useIsTestnetEnabled';

export default function useAccountAssets (address: string | undefined): FetchedBalance[] | undefined | null {
  const [assets, setAssets] = useState<FetchedBalance[] | undefined | null>();
  const { accountsAssets } = useContext(AccountsAssetsContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  useEffect(() => {
    if (!address || !accountsAssets?.balances?.[address]) {
      return;
    }

    /** Filter testnets if they are disabled */
    const _assets = Object.keys(accountsAssets.balances[address]).reduce((allAssets: FetchedBalance[], genesisHash: string) => allAssets.concat(accountsAssets.balances[address][genesisHash]), []);

    const filteredAssets = isTestnetEnabled === false ? _assets?.filter(({ genesisHash }) => !TEST_NETS.includes(genesisHash)) : _assets;

    setAssets(
      filteredAssets?.length > 0
        ? filteredAssets
        : filteredAssets?.length === 0
          ? null
          : undefined
    );
  }, [accountsAssets, address, isTestnetEnabled]);

  return assets;
}
