// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '../util/types';

import { useContext, useMemo } from 'react';

import { AccountsAssetsContext } from '../components';
import { isHexToBn } from '../util';
import { TEST_NETS } from '../util/constants';
import useIsTestnetEnabled from './useIsTestnetEnabled';

export const BN_MEMBERS = [
  'totalBalance',
  'availableBalance',
  'soloTotal',
  'poolReward',
  'pooledBalance',
  'lockedBalance',
  'vestingLocked',
  'vestedClaimable',
  'vestingTotal',
  'freeBalance',
  'frozenBalance',
  'frozenFee',
  'frozenMisc',
  'reservedBalance',
  'votingBalance'
];

export default function useAccountAssets (address: string | undefined): FetchedBalance[] | undefined | null {
  const { accountsAssets } = useContext(AccountsAssetsContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  return useMemo(() => {
    if (!address || !accountsAssets?.balances?.[address]) {
      return undefined;
    }

    const rawAssets = Object.values(accountsAssets.balances[address])
      .flat()
      .filter(({ genesisHash }) => isTestnetEnabled || !TEST_NETS.includes(genesisHash))
      .map((asset) => {
        const updatedAsset = { ...asset };

        BN_MEMBERS.forEach((key) => {
          const _key = key as keyof typeof updatedAsset;

          if (updatedAsset[_key]) {
            //@ts-ignore
            updatedAsset[_key] = isHexToBn(updatedAsset[_key] as string);
          }
        });

        return updatedAsset as FetchedBalance;
      });

    return rawAssets.length ? rawAssets : null;
  }, [address, accountsAssets, isTestnetEnabled]);
}
