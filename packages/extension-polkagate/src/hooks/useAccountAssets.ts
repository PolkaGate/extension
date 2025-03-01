// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from './useAssetsBalances';

import { useContext, useEffect, useState } from 'react';

import { AccountsAssetsContext } from '../components';
import { TEST_NETS } from '../util/constants';
import { isHexToBn } from '../util/utils';
import { BN_MEMBERS } from './useAssetsBalances';
import useIsTestnetEnabled from './useIsTestnetEnabled';

export default function useAccountAssets(address: string | undefined): FetchedBalance[] | undefined | null {
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
      const updatedAsset = { ...asset } as FetchedBalance;

      Object.keys(updatedAsset).forEach((_key) => {
        const key = _key as keyof FetchedBalance;

        if (BN_MEMBERS.includes(key)) {
          // @ts-ignore
          updatedAsset[key] = isHexToBn(updatedAsset[key] as string);
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
