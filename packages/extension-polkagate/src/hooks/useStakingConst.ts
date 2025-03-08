// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { StakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { MAX_NOMINATIONS } from '../util/constants';
import { sanitizeChainName, toBN } from '../util/utils';
import useCurrentEraIndex2 from './useCurrentEraIndex2';
import { useChainInfo } from '.';

/**
 * Custom hook to retrieve and store staking constants based on the provided `genesisHash`.
 * Fetches staking constants from the Polkadot/Substrate chain and caches them in localStorage.
 *
 * @param {string | undefined} genesisHash - The genesis hash of the chain to fetch staking constants for.
 * @param {StakingConsts | undefined | null} [stateConsts] - Optionally, external staking constants to override the fetched values.
 *
 * @returns {StakingConsts | null | undefined} - Returns the staking constants for the given chain, either from localStorage, the API, or undefined if no constants are available.
 */
export default function useStakingConst (genesisHash: string | undefined, stateConsts?: StakingConsts): StakingConsts | null | undefined {
  const { api, chain, token } = useChainInfo(genesisHash);
  const eraIndex = useCurrentEraIndex2(genesisHash);
  const chainName = sanitizeChainName(chain?.name);

  const [newConsts, setNewConsts] = useState<StakingConsts | undefined | null>();
  const [savedConsts, setSavedConsts] = useState<StakingConsts | undefined | null>();

  const getStakingConsts = useCallback(async (api: ApiPromise) => {
    const at = await api.rpc.chain.getFinalizedHead();
    const apiAt = await api.at(at);

    const [minNominatorBond, currentEraIndex] = await Promise.all([
      apiAt.query['staking']['minNominatorBond'](),
      api.query['staking']['currentEra']()
    ]);

    const sessionsPerEra = Number(apiAt.consts['staking']['sessionsPerEra']);
    const epochDuration = apiAt.consts['babe']['epochDuration'];
    const expectedBlockTime = api.consts['babe']['expectedBlockTime'];
    const epochDurationInHours = Number(epochDuration) * Number(expectedBlockTime) / 3600000; // 1000 milSec * 60sec * 60min
    const bondingDuration = Number(apiAt.consts['staking']['bondingDuration']);

    const result = {
      bondingDuration,
      decimal: api.registry.chainDecimals[0],
      eraDuration: sessionsPerEra * epochDurationInHours,
      eraIndex: Number(currentEraIndex),
      existentialDeposit: toBN(apiAt.consts['balances']['existentialDeposit']),
      maxNominations: Number(apiAt.consts['staking']['maxNominations'] || MAX_NOMINATIONS),
      maxNominatorRewardedPerValidator: Number(apiAt.consts['staking']['maxExposurePageSize']),
      minNominatorBond: toBN(minNominatorBond),
      token: api.registry.chainTokens[0],
      unbondingDuration: Number(bondingDuration) * Number(sessionsPerEra) * Number(epochDurationInHours) / 24 // unbondingDuration in days
    };

    window.localStorage.setItem(`${chainName}_stakingConsts`, JSON.stringify(result));
    setNewConsts(result);
  }, [chainName]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedStakingConsts = chainName && window.localStorage.getItem(`${chainName}_stakingConsts`);

    if (localSavedStakingConsts) {
      const parsedConsts = JSON.parse(localSavedStakingConsts) as StakingConsts;

      parsedConsts.existentialDeposit = toBN(parsedConsts.existentialDeposit);
      parsedConsts.minNominatorBond = toBN(parsedConsts.minNominatorBond);

      setSavedConsts(parsedConsts);
    }
  }, [chainName]);

  useEffect(() => {
    if (stateConsts) {
      return setSavedConsts(stateConsts);
    }

    const isSavedVersionOutOfDate = eraIndex !== savedConsts?.eraIndex;

    api && chainName && eraIndex && isSavedVersionOutOfDate && getStakingConsts(api).catch(console.error);
  }, [chainName, getStakingConsts, stateConsts, eraIndex, savedConsts, api]);

  return (newConsts && newConsts.token === token)
    ? newConsts
    : (savedConsts && savedConsts.token === token)
      ? savedConsts
      : undefined;
}
