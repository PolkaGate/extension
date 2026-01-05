// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN, BN_ZERO, bnMax, hexToString } from '@polkadot/util';

import getChainName from '../../getChainName';
import getPoolAccounts from '../../getPoolAccounts';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from '../utils';

/**
 * Get all information regarding a pool
 * @typedef {Object} RewardIdBalance
 * @property {RewardIdBalanceData} data - The pool reward id balance data
 * @typedef {Object} RewardIdBalanceData
 * @property {number} free - The pool reward id free balance
 * @property {number} frozen - The pool reward id frozen balance
 * @typedef {Object} PoolMember
 * @property {number} poolId - The pool id
 * @property {number} points - The staked amount
 * @typedef {Object} RewardPools
 * @property {number} lastRecordedTotalPayouts - The last recorded total payouts
 * @property {number} totalRewardsClaimed - The total rewards claimed
 * @property {number} totalCommissionPending - The total commission pending
 * @property {number} totalCommissionClaimed - The total commission claimed
 * @param {string} stakerAddress - The address of the staker of the pool
 * @param {number | undefined} id - The specific pool id
 * @param {MessagePort} port
 * @param {string} genesisHash
 */
export async function getPool (genesisHash, stakerAddress, id, port) {
  const chainName = getChainName(genesisHash);
  const endpoints = getChainEndpoints(chainName ?? '');

  const { api, connections } = await fastestEndpoint(endpoints);

  console.log(`getPool is called for ${stakerAddress} on chain ${chainName}`);
  id && console.log('getPool is called to fetch the pool with poolId:', id);

  const token = api.registry.chainTokens[0];
  const decimal = api.registry.chainDecimals[0];

  let poolId = id ?? 0;
  /** @type {PoolMember | null | undefined} */
  let member;

  if (poolId === 0) {
    const members = await api.query['nominationPools']['poolMembers'](stakerAddress);

    member = members.isEmpty ? undefined : /** @type {PoolMember | null} */ (members.toPrimitive());

    if (!member) {
      console.log(`can not find member for ${stakerAddress}`);

      port.postMessage(JSON.stringify({ functionName: 'getPool', results: JSON.stringify(null) }));

      return;
    }

    poolId = member.poolId;
  }

  const accounts = getPoolAccounts(api, poolId);

  if (!accounts) {
    console.log(`can not find a pool with id:${poolId}`);

    port.postMessage(JSON.stringify({ functionName: 'getPool', results: JSON.stringify(null) }));

    return;
  }

  const [metadata, bondedPools, myClaimable, pendingRewards, rewardIdBalance, stashIdAccount] = await Promise.all([
    api.query['nominationPools']['metadata'](poolId),
    api.query['nominationPools']['bondedPools'](poolId),
    api.call['nominationPoolsApi']?.['pendingRewards'](stakerAddress), // not available on paseo hub
    api.query['nominationPools']['rewardPools'](poolId),
    api.query['system']['account'](accounts.rewardId),
    api.derive.staking.account(accounts.stashId)
  ]);

  const ED = /** @type {unknown} */ (api.consts['balances']['existentialDeposit']);

  const rewardIdBalancePrimitive = rewardIdBalance.isEmpty ? null : /** @type {RewardIdBalance} */ (rewardIdBalance.toPrimitive());
  const rewardPool = pendingRewards.isEmpty ? null : /** @type {RewardPools | null} */(pendingRewards.toPrimitive());
  const unwrappedBondedPool = bondedPools.isEmpty ? null : bondedPools.toPrimitive();

  const rewardIdFreeBalance = new BN(rewardIdBalancePrimitive?.data.free ?? 0);
  const poolRewardClaimable = rewardIdBalance ? bnMax(BN_ZERO, rewardIdFreeBalance.sub(/** @type {BN} */(ED))) : BN_ZERO;

  /** @type {{ accountId: string; member: PoolMember; }[]} */
  let poolMembers = [];

  const poolInfo = {
    accounts,
    bondedPool: unwrappedBondedPool,
    decimal,
    member,
    metadata: metadata.isEmpty
      ? null
      : hexToString(metadata.toHex()),
    myClaimable: Number(myClaimable ?? '0'),
    poolId,
    poolMembers,
    rewardClaimable: Number(poolRewardClaimable),
    rewardIdBalance: rewardIdBalancePrimitive?.data,
    rewardPool,
    stashIdAccount,
    token
  };

  port.postMessage(JSON.stringify({ functionName: 'getPool', results: JSON.stringify(poolInfo) }));

  const allPoolMembers = await api.query['nominationPools']['poolMembers'].entries();

  poolMembers = allPoolMembers.map((poolMember) => {
    const array = /** @type {string[]} */(poolMember[0].toHuman());
    const accountId = array[0];
    const info = /** @type {PoolMember} */(poolMember[1].toPrimitive());

    if (poolId === info.poolId) {
      return {
        accountId,
        member: info
      };
    }

    return undefined;
  }).filter((item) => !!item);

  poolMembers?.length >= 2 && poolMembers.sort((a, b) => b.member.points - a.member.points);

  poolInfo.poolMembers = poolMembers;

  port.postMessage(JSON.stringify({ functionName: 'getPool', results: JSON.stringify(poolInfo) }));

  closeWebsockets(connections);
}
