// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { BalancesInfo, SavedBalances } from '../util/types';

import { useEffect, useState } from 'react';

import { updateMeta } from '../messaging';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../util/constants';
import useBalancesOnAssethub from './useBalancesOnAssethub';
import useBalancesOnMultiAssetChain from './useBalancesOnMultiAssetChain';
import useChainInfo from './useChainInfo';
import useNativeAssetBalances from './useNativeAssetBalances';
import usePoolBalances from './usePoolBalances';
import { isUpToDate } from './useSavedAssetsCache';
import useSelectedAccount from './useSelectedAccount';

export default function useBalances (address: string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>, onlyNew = false, assetId?: string | number): BalancesInfo | undefined {
  const { api, chainName, decimal: currentDecimal, token: currentToken } = useChainInfo(genesisHash);
  const account = useSelectedAccount();

  const isNativeAssetId = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB) || assetId === 'undefined';
  const maybeNonNativeAssetId = isNativeAssetId ? undefined : assetId;

  const balances = useNativeAssetBalances(address, genesisHash, refresh, setRefresh, onlyNew);
  const maybeBalancesOnAssetHub = useBalancesOnAssethub(address, genesisHash, maybeNonNativeAssetId);
  const maybeBalancesOnMultiChainAssets = useBalancesOnMultiAssetChain(address, genesisHash, maybeNonNativeAssetId);
  const pooledBalance = usePoolBalances(address, genesisHash, refresh); // can move it inside useNativeAssetBalances hook and then remove overall state var

  const [overall, setOverall] = useState<BalancesInfo | undefined>();

  const assetBalance = maybeBalancesOnAssetHub || maybeBalancesOnMultiChainAssets;
  const token = api?.registry.chainTokens[0];
  const decimal = api?.registry.chainDecimals[0];
  const apiGenesisHash = api?.genesisHash?.toString();

  useEffect(() => {
    if (balances && isUpToDate(balances?.date) && pooledBalance && apiGenesisHash === genesisHash && apiGenesisHash === balances?.genesisHash && apiGenesisHash === pooledBalance.genesisHash) {
      setOverall({
        ...balances,
        pooledBalance: pooledBalance.balance
      });
    } else {
      setOverall(undefined);
    }
  }, [pooledBalance, balances, apiGenesisHash, genesisHash]);

  // TODO - account?.balances won't work!!!!!! because since now accounts are on substrate mode!!! @AMIRKHANEF @Nick-1979
  useEffect(() => {
    if (!address || !apiGenesisHash || apiGenesisHash !== account?.genesisHash || !overall || !chainName || !token || !decimal || account?.genesisHash !== genesisHash || account?.genesisHash !== overall.genesisHash) {
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
  }, [Object.keys(account ?? {})?.length, account?.genesisHash, address, apiGenesisHash, pooledBalance, genesisHash, chainName, decimal, overall, token]);

  if (maybeNonNativeAssetId) {
    return assetBalance;
  }

  return overall && overall.genesisHash === genesisHash && overall.token === currentToken && overall.decimal === currentDecimal
    ? overall
    : balances && balances.genesisHash === genesisHash && balances.token === currentToken && balances.decimal === currentDecimal
      ? balances
      : undefined;
}
