// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { BN } from '@polkadot/util';
import type { BalancesInfo, SavedBalances } from '../util/types';

import { useEffect, useState } from 'react';

import { updateMeta } from '../messaging';
import { useBalancesOnAssethub, useBalancesOnMultiAssetChain, useBalancesOnSingleAssetChain, useInfo, usePoolBalances, useStakingAccount } from '.';

export default function useBalances (address: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>, onlyNew = false, assetId?: string | number): BalancesInfo | undefined {
  const stakingAccount = useStakingAccount(address);
  const { account, api, chain, chainName, decimal: currentDecimal, token: currentToken } = useInfo(address);

  const balances = useBalancesOnSingleAssetChain(address, refresh, setRefresh, onlyNew);
  const maybeBalancesOnAssetHub = useBalancesOnAssethub(address, assetId);
  const maybeBalancesOnMultiChainAssets = useBalancesOnMultiAssetChain(address, assetId);
  const pooledBalance = usePoolBalances(address, refresh);

  const assetBalance = maybeBalancesOnAssetHub || maybeBalancesOnMultiChainAssets;

  const [overall, setOverall] = useState<BalancesInfo | undefined>();

  const token = api?.registry.chainTokens[0];
  const decimal = api?.registry.chainDecimals[0];

  useEffect(() => {
    const apiGenesisHash = api?.genesisHash?.toString();

    if (onlyNew && balances && pooledBalance && apiGenesisHash === chain?.genesisHash && apiGenesisHash === balances?.genesisHash && apiGenesisHash === pooledBalance.genesisHash) {
      setOverall({
        ...balances,
        pooledBalance: pooledBalance.balance,
        soloTotal: stakingAccount?.stakingLedger?.total as unknown as BN
      });
    } else {
      setOverall(undefined);
    }
  }, [pooledBalance, balances, onlyNew, api?.genesisHash, account?.genesisHash, chain?.genesisHash, stakingAccount]);

  useEffect(() => {
    if (!address || !api || api.genesisHash.toString() !== account?.genesisHash || !overall || !chainName || !token || !decimal || account?.genesisHash !== chain?.genesisHash || account?.genesisHash !== overall.genesisHash) {
      return;
    }

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
  }, [Object.keys(account ?? {})?.length, account?.genesisHash, address, api, pooledBalance, chain, chainName, decimal, overall, token]);

  if (assetId !== undefined) {
    return assetBalance;
  }

  return overall && overall.genesisHash === chain?.genesisHash && overall.token === currentToken && overall.decimal === currentDecimal
    ? overall
    : balances && balances.token === currentToken && balances.decimal === currentDecimal
      ? balances
      : undefined;
}
