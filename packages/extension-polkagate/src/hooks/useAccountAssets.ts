// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
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

/**
 * A React hook that returns the list of assets and balances for a given account address.
 *
 * It filters the assets based on the chain's genesis hash and whether testnets are enabled.
 * All relevant numeric fields are converted from hex strings to BN instances.
 *
 * @param {string | undefined} address - The account address for which to fetch assets.
 * @param {string} [genesisHash] - Optional chain genesis hash to filter assets for a specific chain.
 * @returns {FetchedBalance[] | undefined | null} 
 *   - Returns an array of `FetchedBalance` objects if assets exist,
 *   - `null` if the account has no matching assets,
 *   - `undefined` if the address is not provided or balances are unavailable.
 */

export default function useAccountAssets(address: string | undefined, genesisHash?: string): FetchedBalance[] | undefined | null {
  const { accountsAssets } = useContext(AccountsAssetsContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  return useMemo(() => {
    const userBalances = address ? accountsAssets?.balances?.[address] : undefined;

    if (!address || !userBalances || isTestnetEnabled === undefined) {
      return undefined;
    }

    const rawAssets = Object.values(userBalances)
      .flatMap((assets) =>
        assets.filter(
          ({ genesisHash: gHash }) =>
            (isTestnetEnabled || !TEST_NETS.includes(gHash)) &&
            (!genesisHash || gHash === genesisHash) // filter assets based on genesisHash if any
        )
      )
      .map((asset) => {
        const updatedAsset: FetchedBalance = {
          ...asset,
          ...BN_MEMBERS.reduce((acc, key) => {
            const val = asset[key as keyof FetchedBalance] as unknown;

            if (val) {
              acc[key as keyof typeof acc] = isHexToBn(val as string);
            }

            return acc;
          }, {} as Partial<FetchedBalance>)
        };

        return updatedAsset;
      });

    return rawAssets.length ? rawAssets : null;
  }, [address, accountsAssets?.balances, genesisHash, isTestnetEnabled]);
}
