// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { BalancesInfo, SavedBalances } from '../util/types';

import { useEffect, useState } from 'react';

import { updateMeta } from '../messaging';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../util/constants';
import { isUpToDate } from './useAssetsBalances';
import { useBalancesOnAssethub, useBalancesOnMultiAssetChain, useInfo, useNativeAssetBalances, usePoolBalances } from '.';

export default function useBalances (address: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>, onlyNew = false, assetId?: string | number): BalancesInfo | undefined {
  const { account, api, chainName, decimal: currentDecimal, genesisHash: chainGenesisHash, token: currentToken } = useInfo(address);

  const isNativeAssetId = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB) || assetId === 'undefined';
  const maybeNonNativeAssetId = isNativeAssetId ? undefined : assetId;

  const balances = useNativeAssetBalances(address, refresh, setRefresh, onlyNew);
  const maybeBalancesOnAssetHub = useBalancesOnAssethub(address, maybeNonNativeAssetId);
  const maybeBalancesOnMultiChainAssets = useBalancesOnMultiAssetChain(address, maybeNonNativeAssetId);
  const pooledBalance = usePoolBalances(address, refresh); // can move it inside useNativeAssetBalances hook and then remove overall state var

  const [overall, setOverall] = useState<BalancesInfo | undefined>();

  const assetBalance = maybeBalancesOnAssetHub || maybeBalancesOnMultiChainAssets;
  const token = api?.registry.chainTokens[0];
  const decimal = api?.registry.chainDecimals[0];
  const apiGenesisHash = api?.genesisHash?.toString();

  useEffect(() => {
    if (balances && isUpToDate(balances?.date) && pooledBalance && apiGenesisHash === chainGenesisHash && apiGenesisHash === balances?.genesisHash && apiGenesisHash === pooledBalance.genesisHash) {
      setOverall({
        ...balances,
        pooledBalance: pooledBalance.balance
      });
    } else {
      setOverall(undefined);
    }
  }, [pooledBalance, balances, apiGenesisHash, chainGenesisHash]);

  useEffect(() => {
    if (!address || !apiGenesisHash || apiGenesisHash !== account?.genesisHash || !overall || !chainName || !token || !decimal || account?.genesisHash !== chainGenesisHash || account?.genesisHash !== overall.genesisHash) {
      return;
    }

    // TODO: this just SAVES native assets in local storage! can save other assets as well
    /** to SAVE fetched balance in local storage, first load saved balances of different chaines if any */
    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    const balances = {
      ED: overall.ED.toString(),
      assetId: overall.assetId,
      availableBalance: overall.availableBalance.toString(),
      freeBalance: overall.freeBalance.toString(),
      frozenBalance: overall.frozenBalance.toString(),
      genesisHash: overall.genesisHash,
      lockedBalance: overall.lockedBalance.toString(),
      pooledBalance: overall.pooledBalance?.toString(),
      reservedBalance: overall.reservedBalance.toString(),
      vestedBalance: overall.vestedBalance.toString(),
      vestedClaimable: overall.vestedClaimable.toString(),
      votingBalance: overall.votingBalance.toString()
    } as unknown as Record<string, string>;

    // add this chain balances
    savedBalances[chainName] = { balances, date: Date.now(), decimal, token };
    const metaData = JSON.stringify({ balances: JSON.stringify(savedBalances) });

    updateMeta(address, metaData).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, account?.genesisHash, address, apiGenesisHash, pooledBalance, chainGenesisHash, chainName, decimal, overall, token]);

  if (maybeNonNativeAssetId) {
    return assetBalance;
  }

  return overall && overall.genesisHash === chainGenesisHash && overall.token === currentToken && overall.decimal === currentDecimal
    ? overall
    : balances && balances.genesisHash === chainGenesisHash && balances.token === currentToken && balances.decimal === currentDecimal
      ? balances
      : undefined;
}
