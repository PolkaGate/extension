// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Balance } from '@polkadot/types/interfaces';
//@ts-ignore
import type { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import type { HexString } from '@polkadot/util/types';
import type { BalancesInfo, SavedBalances } from '../util/types';

import { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { FetchingContext } from '../components';
import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../util/constants';
import { decodeMultiLocation } from '../util/utils';
import { useInfo, useStakingAccount } from '.';

export default function useNativeAssetBalances (address: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>, onlyNew = false): BalancesInfo | undefined {
  const stakingAccount = useStakingAccount(address, undefined, undefined, undefined, onlyNew);
  const { account, api, chainName, decimal: currentDecimal, formatted, genesisHash, token: currentToken } = useInfo(address);
  const isFetching = useContext(FetchingContext);

  const [balances, setBalances] = useState<BalancesInfo | undefined>();
  const [newBalances, setNewBalances] = useState<BalancesInfo | undefined>();

  const isFetchingNativeTokenOfAssetHub = genesisHash && ASSET_HUBS.includes(genesisHash);

  const token = api?.registry.chainTokens[0];
  const decimal = api?.registry.chainDecimals[0];

  const getBalances = useCallback(() => {
    if (!chainName || !genesisHash || api?.genesisHash?.toString() !== genesisHash || !decimal || !token) {
      return;
    }

    const ED = api.consts['balances'] ? api.consts['balances']['existentialDeposit'] as unknown as BN : BN_ZERO;

    formatted && api.derive.balances?.all(formatted).then((allBalances) => {
      //@ts-ignore
      api.query['system']['account'](formatted).then(({ data: systemBalance }: FrameSystemAccountInfo) => {
        // some chains such as PARALLEL does not support this call hence BN_ZERO is set for them
        const frozenBalance = systemBalance?.frozen || BN_ZERO;

        const votingBalance = api.createType('Balance', allBalances.freeBalance.add(allBalances.reservedBalance)) as unknown as Balance;

        setNewBalances({
          ED,
          assetId: isFetchingNativeTokenOfAssetHub ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID,
          ...allBalances,
          chainName,
          date: Date.now(),
          decimal,
          frozenBalance,
          genesisHash: api.genesisHash.toString(),
          pooledBalance: balances?.pooledBalance, // fill from saved balance it exists, it will be updated
          soloTotal: stakingAccount?.stakingLedger?.total as unknown as BN,
          token,
          votingBalance // since api derive does not updated after pools migration
        });
        setRefresh?.(false);
        isFetching.fetching[String(formatted)]['balances'] = false;
        isFetching.set(isFetching.fetching);
      }).catch(console.error);
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, genesisHash, chainName, decimal, stakingAccount, token, isFetchingNativeTokenOfAssetHub, balances, formatted, isFetching.fetching[String(formatted)]?.['length'], setRefresh]);

  useEffect(() => {
    if (!formatted || !token || !decimal || !chainName || api?.genesisHash?.toString() !== genesisHash) {
      return;
    }

    /** to fetch a formatted address's balance if not already fetching */
    if (!isFetching.fetching[String(formatted)]?.['balances']) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {};
      }

      isFetching.fetching[String(formatted)]['balances'] = true;
      isFetching.set(isFetching.fetching);
      getBalances();
    } else {
      console.info(`Balance is fetching for ${formatted}, hence doesn't need to fetch it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, genesisHash, chainName, decimal, formatted, getBalances, isFetching.fetching[String(formatted)]?.['length'], token]);

  useEffect(() => {
    if (refresh) {
      setBalances(undefined);
      setNewBalances(undefined);

      if (isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)]['balances'] = true;
      }

      isFetching.set(isFetching.fetching);
      getBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(isFetching?.fetching ?? {})?.length, formatted, getBalances, refresh]);

  useEffect(() => {
    if (!chainName || !account || account?.genesisHash !== genesisHash) {
      return;
    }

    // to LOAD saved balances
    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    if (savedBalances[chainName]) {
      const sb = savedBalances[chainName].balances;

      const maybeAssetId = sb['assetId'];
      const isForeignAsset = maybeAssetId && String(maybeAssetId).startsWith('0x');
      const assetId = maybeAssetId === undefined
        ? undefined
        : isForeignAsset
          ? decodeMultiLocation(maybeAssetId as HexString)
          : parseInt(maybeAssetId);

      const lastBalances = {
        ED: new BN(sb['ED'] || '0'),
        assetId,
        availableBalance: new BN(sb['availableBalance']),
        chainName,
        date: savedBalances[chainName].date,
        decimal: savedBalances[chainName].decimal,
        freeBalance: new BN(sb['freeBalance']),
        frozenBalance: new BN(sb['frozenBalance'] || '0'),
        genesisHash: sb['genesisHash'],
        lockedBalance: new BN(sb['lockedBalance']),
        pooledBalance: new BN(sb['pooledBalance']),
        reservedBalance: new BN(sb['reservedBalance']),
        token: savedBalances[chainName].token,
        vestedBalance: new BN(sb['vestedBalance']),
        vestedClaimable: new BN(sb['vestedClaimable']),
        votingBalance: new BN(sb['votingBalance'])
      } as BalancesInfo;

      setBalances({
        ...lastBalances,
        soloTotal: stakingAccount?.stakingLedger?.total as unknown as BN
      });

      return;
    }

    setBalances(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, address, chainName, stakingAccount, genesisHash]);

  if (onlyNew) {
    return newBalances; // returns balances that have been fetched recently and are not from the local storage, and it does not include the pooledBalance
  }

  const _balances = newBalances || balances;

  return _balances && _balances.token === currentToken && _balances.decimal === currentDecimal
    ? _balances
    : undefined;
}
