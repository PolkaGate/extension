// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { NATIVE_TOKEN_ASSET_ID,TEST_NETS } from '../constants';
import getPoolAccounts from '../getPoolAccounts';
import { getPriceIdByChainName } from '../utils';
import { balancify, closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

async function getPooledBalance(api, address) {
  const response = await api.query['nominationPools']['poolMembers'](address);
  const member = response && response.unwrapOr(undefined);

  if (!member) {
    return BN_ZERO;
  }

  const poolId = member.poolId;
  const accounts = poolId && getPoolAccounts(api, poolId);

  if (!accounts) {
    return BN_ZERO;
  }

  const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
    api.query['nominationPools']['bondedPools'](poolId),
    api.derive.staking.account(accounts.stashId),
    api.call['nominationPoolsApi']['pendingRewards'](address)
  ]);

  const active = member.points.isZero()
    ? BN_ZERO
    : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));

  const rewards = myClaimable;
  let unlockingValue = BN_ZERO;

  member?.unbondingEras?.forEach((value) => {
    unlockingValue = unlockingValue.add(value);
  });

  return active.add(rewards).add(unlockingValue);
}

async function getBalances(chainName, addresses) {
  const chainEndpoints = getChainEndpoints(chainName);

  const { api, connections } = await fastestEndpoint(chainEndpoints, false);

  if (api.isConnected && api.derive.balances) {
    const requests = addresses.map(async (address) => {
      const balances = await api.derive.balances.all(address);
      let soloTotal = BN_ZERO;
      let pooledBalance = BN_ZERO;

      if (api.query.nominationPools) {
        pooledBalance = await getPooledBalance(api, address);
      }

      if (api.query.staking?.ledger) {
        const ledger = await api.query.staking.ledger(address);

        if (ledger.isSome) {
          soloTotal = ledger?.unwrap()?.total?.toString();
        }
      }

      return { address, balances, pooledBalance, soloTotal };
    });

    return { api, balanceInfo: await Promise.all(requests), connectionsToBeClosed: connections };
  }
}

async function getAssetOnRelayChain(addresses, chainName) {
  const results = {};

  await getBalances(chainName, addresses)
    .then(({ api, balanceInfo, connectionsToBeClosed }) => {
      balanceInfo.forEach(({ address, balances, pooledBalance, soloTotal }) => {
        const totalBalance = balances.freeBalance.add(balances.reservedBalance).add(pooledBalance);
        const genesisHash = api.genesisHash.toString();
        const priceId = TEST_NETS.includes(genesisHash)
          ? undefined
          : getPriceIdByChainName(chainName);

        results[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
          assetId: NATIVE_TOKEN_ASSET_ID, // Rule: we set asset id 0 for native tokens
          balanceDetails: balancify({ ...balances, pooledBalance, soloTotal }),
          chainName,
          decimal: api.registry.chainDecimals[0],
          genesisHash,
          priceId,
          token: api.registry.chainTokens[0],
          totalBalance: String(totalBalance)
        }];
      });

      closeWebsockets(connectionsToBeClosed);
    })
    .catch((error) => {
      console.error(`getAssetOnRelayChain: Error fetching balances for ${chainName}:`, error);
    }).finally(() => {
      Object.keys(results).length ? postMessage(JSON.stringify(results)) : postMessage(undefined);
    });
}

onmessage = async (e) => {
  const { addresses, chainName } = e.data;

  let tryCount = 1;

  console.log(`getAssetOnRelayChain: try ${tryCount} to fetch assets on ${chainName}.`);

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      await getAssetOnRelayChain(addresses, chainName);

      tryCount = 0;

      return;
    } catch (error) {
      console.error(`Error while fetching assets on relay chains, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage(undefined);
    }

    tryCount++;
  }
};
