// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Asset } from '@polkagate/apps-config/assets/types';
import type { Option } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';
// @ts-ignore
import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolMember } from '@polkadot/types/lookup';
import type { BalancesInfo, SavedBalances } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { FetchingContext } from '../components';
import { toCamelCase } from '../fullscreen/governance/utils/util';
import { updateMeta } from '../messaging';
import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID } from '../util/constants';
import getPoolAccounts from '../util/getPoolAccounts';
import { useInfo, useStakingAccount } from '.';

const assetsChains = createAssets();

// TODO: decouple thi shook to smaller independent ones like usePoolBalance, useAssetBalance, useNativeBalance ...
export default function useBalances(address: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>, onlyNew = false, assetId?: number): BalancesInfo | undefined {
  const stakingAccount = useStakingAccount(address);
  const { account, api, chain, chainName, decimal: currentDecimal, formatted, token: currentToken } = useInfo(address);
  const isFetching = useContext(FetchingContext);

  const mayBeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];
  const isAssetHub = ASSET_HUBS.includes(chain?.genesisHash || '');

  const [assetBalance, setAssetBalance] = useState<BalancesInfo | undefined>();
  const [balances, setBalances] = useState<BalancesInfo | undefined>();
  const [newBalances, setNewBalances] = useState<BalancesInfo | undefined>();
  const [pooledBalance, setPooledBalance] = useState<{ balance: BN, genesisHash: string } | null>();
  const [overall, setOverall] = useState<BalancesInfo | undefined>();

  const token = api && api.registry.chainTokens[0];
  const decimal = api && api.registry.chainDecimals[0];

  const getPoolBalances = useCallback(() => {
    if (api && !api.query['nominationPools']) {
      return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() });
    }

    api && formatted && api.query['nominationPools']['poolMembers'](formatted).then(async (res: any) => {
      const member = res?.unwrapOr(undefined) as PalletNominationPoolsPoolMember | undefined;

      if (!member) {
        isFetching.fetching[String(formatted)]['pooledBalance'] = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() }); // user does not joined a pool yet. or pool id does not exist
      }

      const poolId = member.poolId;
      const accounts = poolId && getPoolAccounts(api, poolId);

      if (!accounts) {
        console.log(`useBalances: can not find a pool with id: ${poolId}`);

        isFetching.fetching[String(formatted)]['pooledBalance'] = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() });
      }

      const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
        api.query['nominationPools']['bondedPools'](poolId) as unknown as Option<PalletNominationPoolsBondedPoolInner>,
        api.derive.staking.account(accounts.stashId),
        api.call['nominationPoolsApi']['pendingRewards'](formatted)
      ]);

      const active = member.points.isZero()
        ? BN_ZERO
        : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));
      const rewards = myClaimable as Balance;
      let unlockingValue = BN_ZERO;

      member?.unbondingEras?.forEach((value: BN) => {
        unlockingValue = unlockingValue.add(value);
      });

      api.genesisHash.toString() === chain?.genesisHash && setPooledBalance({ balance: active.add(rewards).add(unlockingValue), genesisHash: api.genesisHash.toString() });
      setRefresh && setRefresh(false);
      isFetching.fetching[String(formatted)]['pooledBalance'] = false;
      isFetching.set(isFetching.fetching);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, formatted, isFetching.fetching[String(formatted)]?.['length'], setRefresh]);

  const getBalances = useCallback(() => {
    if (!chainName || api?.genesisHash?.toString() !== chain?.genesisHash || !decimal || !token) {
      return;
    }

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;

    formatted && api.derive.balances?.all(formatted).then((b) => {
      setNewBalances({
        ...b,
        ED,
        assetId: NATIVE_TOKEN_ASSET_ID,
        chainName,
        date: Date.now(),
        decimal,
        genesisHash: api.genesisHash.toString(),
        token
      });

      setRefresh && setRefresh(false);
      isFetching.fetching[String(formatted)]['balances'] = false;
      isFetching.set(isFetching.fetching);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, chainName, formatted, isFetching.fetching[String(formatted)]?.['length'], setRefresh]);

  useEffect(() => {
    if (newBalances && pooledBalance && api?.genesisHash?.toString() === chain?.genesisHash && api?.genesisHash?.toString() === newBalances?.genesisHash && api?.genesisHash?.toString() === pooledBalance.genesisHash) {
      setOverall({
        ...newBalances,
        pooledBalance: pooledBalance.balance,
        soloTotal: stakingAccount?.stakingLedger?.total as unknown as BN
      });
    } else {
      setOverall(undefined);
    }
  }, [pooledBalance, newBalances, api?.genesisHash, account?.genesisHash, chain?.genesisHash, stakingAccount]);

  useEffect(() => {
    if (!formatted || !token || !decimal || !chainName || api?.genesisHash?.toString() !== chain?.genesisHash) {
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
      console.log(`Balance is fetching for ${formatted}, hence doesn't need to fetch it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, chainName, decimal, formatted, getBalances, isFetching.fetching[String(formatted)]?.['length'], token]);

  useEffect(() => {
    if (!chain?.genesisHash || !api || !formatted || api.genesisHash.toString() !== chain.genesisHash) {
      return;
    }

    if (!isFetching.fetching[String(formatted)]?.['pooledBalance']) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {};
      }

      isFetching.fetching[String(formatted)]['pooledBalance'] = true;
      isFetching.set(isFetching.fetching);
      getPoolBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, formatted, getPoolBalances, isFetching.fetching[String(formatted)]?.['length']]);

  useEffect(() => {
    if (refresh) {
      setBalances(undefined);
      setNewBalances(undefined);
      setPooledBalance(undefined);

      if (isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)]['pooledBalance'] = false;
        isFetching.fetching[String(formatted)]['balances'] = true;
      }

      isFetching.set(isFetching.fetching);
      getBalances();
      getPoolBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(isFetching?.fetching ?? {})?.length, api, chainName, decimal, formatted, getBalances, getPoolBalances, refresh, token]);

  useEffect(() => {
    if (!address || !api || api.genesisHash.toString() !== account?.genesisHash || !overall || !chainName || !token || !decimal || account?.genesisHash !== chain?.genesisHash || account?.genesisHash !== overall.genesisHash) {
      return;
    }

    /** to SAVE fetched balance in local storage, first load saved balances of different chaines if any */
    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    const balances = {
      assetId: overall.assetId,
      availableBalance: overall.availableBalance.toString(),
      freeBalance: overall.freeBalance.toString(),
      genesisHash: overall.genesisHash,
      lockedBalance: overall.lockedBalance.toString(),
      pooledBalance: overall.pooledBalance && overall.pooledBalance.toString(),
      reservedBalance: overall.reservedBalance.toString(),
      vestedBalance: overall.vestedBalance.toString(),
      vestedClaimable: overall.vestedClaimable.toString(),
      votingBalance: overall.votingBalance.toString()
    };

    // add this chain balances
    savedBalances[chainName] = { balances: balances as any, date: Date.now(), decimal, token };
    const metaData = JSON.stringify({ balances: JSON.stringify(savedBalances) });

    updateMeta(address, metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, account?.genesisHash, address, api, pooledBalance, chain, chainName, decimal, overall, token]);

  useEffect(() => {
    if (!chainName || !account || account?.genesisHash !== chain?.genesisHash) {
      return;
    }

    // to LOAD saved balances
    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    if (savedBalances[chainName]) {
      const sb = savedBalances[chainName].balances;

      const lastBalances = {
        assetId: sb['assetId'] && parseInt(sb['assetId']),
        availableBalance: new BN(sb['availableBalance']),
        chainName,
        date: savedBalances[chainName].date,
        decimal: savedBalances[chainName].decimal,
        freeBalance: new BN(sb['freeBalance']),
        genesisHash: sb['genesisHash'],
        lockedBalance: new BN(sb['lockedBalance']),
        pooledBalance: new BN(sb['pooledBalance']),
        reservedBalance: new BN(sb['reservedBalance']),
        token: savedBalances[chainName].token,
        vestedBalance: new BN(sb['vestedBalance']),
        vestedClaimable: new BN(sb['vestedClaimable']),
        votingBalance: new BN(sb['votingBalance'])
      } as any;

      setBalances({
        ...lastBalances,
        soloTotal: stakingAccount?.stakingLedger?.total as unknown as BN
      });

      return;
    }

    setBalances(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, address, chainName, stakingAccount]);

  useEffect(() => {
    /** We fetch asset hub assets via this hook for asset ids, other multi chain assets have been fetched in the next useEffect*/
    if (assetId === undefined || !api?.query?.['assets'] || !ASSET_HUBS.includes(chain?.genesisHash || '')) {
      return;
    }

    fetchAssetOnAssetHub().catch(console.error);

    async function fetchAssetOnAssetHub() {
      if (!api) {
        return;
      }

      try {
        const [accountAsset, assetInfo, metadata] = await Promise.all([
          api.query['assets']['account'](assetId, formatted) as any,
          api.query['assets']['asset'](assetId) as any,
          api.query['assets']['metadata'](assetId) as any
        ]);

        const ED = assetInfo.isNone ? BN_ZERO : assetInfo.unwrap()?.minBalance as BN;

        const _AccountAsset = accountAsset.isSome ? accountAsset.unwrap() : null;

        const parsedAccountAsset = JSON.parse(JSON.stringify(_AccountAsset));
        const isFrozen = parsedAccountAsset?.status === 'Frozen';
        const balance = (_AccountAsset?.balance || BN_ZERO) as BN;

        const assetBalances = {
          ED,
          assetId,
          availableBalance: isFrozen ? BN_ZERO : balance,
          chainName,
          date: Date.now(),
          decimal: metadata.decimals.toNumber() as number,
          freeBalance: !isFrozen ? balance : BN_ZERO,
          genesisHash: api.genesisHash.toHex(),
          isAsset: true,
          lockedBalance: isFrozen ? balance : BN_ZERO,
          reservedBalance: isFrozen ? balance : BN_ZERO, // JUST to comply with the rule that total=available + reserve
          token: metadata.symbol.toHuman() as string
        };

        setAssetBalance(assetBalances as unknown as BalancesInfo);
      } catch (error) {
        console.error(`Failed to fetch info for assetId ${assetId}:`, error);
      }
    }
  }, [api, assetId, chain?.genesisHash, chainName, formatted]);

  useEffect(() => {
    /** We fetch asset on multi chain assets here*/
    if (api && assetId && mayBeAssetsOnMultiAssetChains && !isAssetHub) {
      const assetInfo = mayBeAssetsOnMultiAssetChains[assetId];

      assetInfo && api.query['tokens'] && fetchAssetOnMultiAssetChain(assetInfo).catch(console.error);
    }

    async function fetchAssetOnMultiAssetChain(assetInfo: Asset) {
      if (!api) {
        return;
      }

      try {
        const assets = await api.query['tokens']['accounts'].entries(address);
        const currencyIdScale = (assetInfo.extras?.['currencyIdScale'] as string).replace('0x', '');

        const found = assets.find((entry) => {
          if (!entry.length) {
            return false;
          }

          const storageKey = entry[0].toString();

          return storageKey.endsWith(currencyIdScale);
        }) as any;

        if (!found?.length) {
          return;
        }

        const currencyId = found[0].toHuman()[1] as unknown;
        const balance = found[1];

        const assetBalances = {
          ED: new BN(assetInfo.extras?.['existentialDeposit'] as string || 0),
          assetId: assetInfo.id,
          availableBalance: balance.free as BN,
          chainName,
          currencyId,
          decimal: assetInfo.decimal,
          freeBalance: balance.free as BN,
          genesisHash: api.genesisHash.toHex(),
          isAsset: true,
          reservedBalance: balance.reserved as BN,
          token: assetInfo.symbol
        };

        setAssetBalance(assetBalances as unknown as BalancesInfo);
      } catch (e) {
        console.error('Something went wrong while fetching an asset:', e);
      }
    }
  }, [address, api, assetId, chainName, isAssetHub, mayBeAssetsOnMultiAssetChains]);

  if (assetId !== undefined) {
    return assetBalance;
  }

  if (onlyNew) {
    return newBalances; //  returns balances that have been fetched recently and are not from the local storage, and it does not include the pooledBalance
  }

  // return overall && overall.genesisHash === chain?.genesisHash ? overall : balances;
  return overall && overall.genesisHash === chain?.genesisHash && overall.token === currentToken && overall.decimal === currentDecimal
    ? overall
    : balances && balances.token === currentToken && balances.decimal === currentDecimal
      ? balances
      : undefined;
}
