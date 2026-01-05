// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option, u32, u128 } from '@polkadot/types';
import type { BN } from '@polkadot/util';
import type { PoolStakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { bnMax } from '@polkadot/util';

import { sanitizeChainName, toBN } from '../util';
import useChainInfo from './useChainInfo';
import useCurrentEraIndex from './useCurrentEraIndex';

/**
 * Custom hook to fetch and manage pool staking constants from the blockchain.
 *
 * This hook retrieves the pool staking constants from the blockchain using the Polkadot API.
 * The constants are cached locally for reuse and updated whenever necessary based on the provided `genesisHash` or `stateConsts` parameter.
 * It includes the maximum pool members, the minimum bond amounts, and the current era index. If available, the constants will be returned as `PoolStakingConsts`.
 *
 * @param {string | undefined} genesisHash - The genesis hash of the chain, used to retrieve relevant chain data.
 * @param {PoolStakingConsts | undefined} [stateConsts] - Optional state constants to use directly, bypassing API fetching.
 * @returns {PoolStakingConsts | null | undefined} The pool staking constants or null if they cannot be retrieved, or undefined if no constants are available for the given token.
 *
 * @example
 * const poolConsts = usePoolConst(genesisHash);
 * if (poolConsts) {
 *   console.log(poolConsts.maxPoolMembers);
 * }
 */
export default function usePoolConst (genesisHash: string | undefined, stateConsts?: PoolStakingConsts): PoolStakingConsts | null | undefined {
  const { api, chain, token } = useChainInfo(genesisHash);
  const eraIndex = useCurrentEraIndex(genesisHash);
  const chainName = sanitizeChainName(chain?.name);

  const [consts, setConsts] = useState<PoolStakingConsts | undefined | null>();
  const [newConsts, setNewConsts] = useState<PoolStakingConsts | undefined | null>();

  const getPoolStakingConsts = useCallback(async (api: ApiPromise) => {
    const at = await api.rpc.chain.getFinalizedHead();
    const apiAt = await api.at(at);

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;

    const [maxPoolMembers, maxPoolMembersPerPool, maxPools, minCreateBond, minJoinBond, minNominatorBond, lastPoolId, currentEra, token, progress] =
      await Promise.all([
        apiAt.query['nominationPools']['maxPoolMembers']() as unknown as Option<u32>,
        apiAt.query['nominationPools']['maxPoolMembersPerPool']() as unknown as Option<u32>,
        apiAt.query['nominationPools']['maxPools']() as unknown as Option<u32>,
        apiAt.query['nominationPools']['minCreateBond']() as unknown as u128,
        apiAt.query['nominationPools']['minJoinBond']() as unknown as u128,
        apiAt.query['staking']['minNominatorBond']() as unknown as u128,
        apiAt.query['nominationPools']['lastPoolId']() as unknown as u32,
        api.query['staking']['currentEra'](),
        api.registry.chainTokens[0],
        api.derive.session.progress()
      ]);

    const results = {
      eraIndex: Number(currentEra?.toString() || '0'),
      lastPoolId: lastPoolId.toBn(),
      maxPoolMembers: maxPoolMembers.isSome ? maxPoolMembers.unwrap().toNumber() : -1,
      maxPoolMembersPerPool: maxPoolMembersPerPool.isSome ? maxPoolMembersPerPool.unwrap().toNumber() : -1,
      maxPools: maxPools.isSome ? maxPools.unwrap().toNumber() : -1,
      minCreateBond: minCreateBond.toBn(),
      minCreationBond: bnMax(minCreateBond as unknown as BN, ED, minNominatorBond).add(ED), // minimum that is needed in action
      minJoinBond: toBN(minJoinBond),
      minNominatorBond: minNominatorBond.toBn(),
      ...progress,
      token
    };

    if (results) {
      window.localStorage.setItem(`${chainName}_poolConst`, JSON.stringify(results));
      setNewConsts(results);
    } else {
      setNewConsts(null);
    }
  }, [chainName]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedPoolConsts = chainName && window.localStorage.getItem(`${chainName}_poolConst`);

    if (localSavedPoolConsts) {
      const parsedConsts = JSON.parse(localSavedPoolConsts) as PoolStakingConsts;

      parsedConsts.lastPoolId = toBN(parsedConsts.lastPoolId);
      parsedConsts.minCreateBond = toBN(parsedConsts.minCreateBond);
      parsedConsts.minCreationBond = toBN(parsedConsts.minCreationBond);
      parsedConsts.minJoinBond = toBN(parsedConsts.minJoinBond);
      parsedConsts.minNominatorBond = toBN(parsedConsts.minNominatorBond);
      parsedConsts.minNominatorBond = toBN(parsedConsts.minNominatorBond);
      parsedConsts.eraLength = toBN(parsedConsts.eraLength);

      setConsts(parsedConsts);
    }
  }, [chainName]);

  useEffect(() => {
    if (stateConsts) {
      return setConsts(stateConsts);
    }

    api && chain && eraIndex && eraIndex !== consts?.eraIndex && getPoolStakingConsts(api).catch(console.error);
  }, [chain, getPoolStakingConsts, stateConsts, eraIndex, consts?.eraIndex, api]);

  return (newConsts && newConsts.token === token)
    ? newConsts
    : (consts && consts.token === token)
      ? consts
      : undefined;
}
