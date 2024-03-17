// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { TEST_NETS } from '../constants';
import getPoolAccounts from '../getPoolAccounts';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

async function getPooledBalance(api, address) {
  const response = await api.query.nominationPools.poolMembers(address);
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
    api.query.nominationPools.bondedPools(poolId),
    api.derive.staking.account(accounts.stashId),
    api.call.nominationPoolsApi.pendingRewards(address)
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

async function getTotalBalance(chainName, addresses) {
  const chainEndpoints = getChainEndpoints(chainName);

  const { api, connections } = await fastestEndpoint(chainEndpoints, false);

  if (api.isConnected && api.derive.balances) {
    const requests = addresses.map(async (address) => {
      const balances = await api.derive.balances.all(address);
      let totalBalance = balances.freeBalance.add(balances.reservedBalance);

      if (api.query.nominationPools) {
        const pooledBalance = await getPooledBalance(api, address);

        totalBalance = totalBalance.add(pooledBalance);
      }

      return { address, totalBalance };
    });

    return { api, balances: await Promise.all(requests), connectionsToBeClosed: connections };
  }
}

async function getAssetOnRelayChain(addresses, chainName) {
  const results = {};

  await getTotalBalance(chainName, addresses)
    .then(({ api, balances, connectionsToBeClosed }) => {
      balances.forEach(({ address, totalBalance }) => {
        if (totalBalance.isZero()) {
          return undefined;
        }

        const genesisHash = api.genesisHash.toString();
        const priceId = TEST_NETS.includes(genesisHash) ? undefined : chainName; // based on the fact that relay chains price id is the same as their sanitized names,except for testnets

        results[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
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
