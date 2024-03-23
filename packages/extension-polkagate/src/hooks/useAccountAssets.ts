// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { AccountsAssetsContext } from '../components';
import { TEST_NETS } from '../util/constants';
import { BN_MEMBERS, FetchedBalance } from './useAssetsBalances';
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
    const _assets = Object.keys(accountsAssets.balances[address]).reduce(
      (allAssets: FetchedBalance[], genesisHash: string) =>
        allAssets.concat(accountsAssets.balances[address][genesisHash])
      , []);

    const filteredAssets = isTestnetEnabled === false ? _assets?.filter(({ genesisHash }) => !TEST_NETS.includes(genesisHash)) : _assets;

    // handle BN conversion
    const assetsConvertedToBN = filteredAssets.map((asset) => {
      const updatedAsset = { ...asset };

      Object.keys(updatedAsset).forEach((key) => {
        if (BN_MEMBERS.includes(key)) {
          updatedAsset[key] = new BN(updatedAsset[key] as string);
        }
      });

      return updatedAsset;
    });

    setAssets(
      assetsConvertedToBN?.length > 0
        ? assetsConvertedToBN
        : assetsConvertedToBN?.length === 0
          ? null
          : undefined
    );
  }, [accountsAssets, address, isTestnetEnabled]);

  return assets;
}
