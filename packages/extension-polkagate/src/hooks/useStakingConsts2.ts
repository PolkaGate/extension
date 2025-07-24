// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { MAX_NOMINATIONS } from '../util/constants';
import { useChainInfo, useCurrentEraIndex2 } from '.';

export default function useStakingConsts2 (genesisHash: string | undefined): StakingConsts | null | undefined {
  const { api, chainName } = useChainInfo(genesisHash);
  const eraIndex = useCurrentEraIndex2(genesisHash);

  const [newConsts, setNewConsts] = useState<StakingConsts | undefined | null>();
  const [savedConsts, setSavedConsts] = useState<StakingConsts | undefined | null>();

  const getStakingConsts = useCallback(async () => {
    try {
      if (!api || !chainName) {
        return;
      }

      const at = await api.rpc.chain.getFinalizedHead();
      const apiAt = await api.at(at);

      const maxNominations = apiAt.consts['electionProviderMultiPhase']['minerMaxVotesPerVoter']?.toPrimitive() as number || MAX_NOMINATIONS;
      const maxNominatorRewardedPerValidator = apiAt.consts['staking']['maxExposurePageSize'].toPrimitive() as number;
      const existentialDepositString = apiAt.consts['balances']['existentialDeposit'].toString();
      const existentialDeposit = new BN(existentialDepositString);
      const bondingDuration = apiAt.consts['staking']['bondingDuration'].toPrimitive() as number;
      const sessionsPerEra = apiAt.consts['staking']['sessionsPerEra'].toPrimitive() as number;
      const epochDuration = apiAt.consts['babe']['epochDuration'].toPrimitive() as number;
      const expectedBlockTime = api.consts['babe']['expectedBlockTime'].toPrimitive() as number;
      const epochDurationInHours = epochDuration * expectedBlockTime / 3600000; // 1000 milSec * 60sec * 60min
      const [minNominatorBond, currentEraIndex] = await Promise.all([
        apiAt.query['staking']['minNominatorBond'](),
        api.query['staking']['currentEra']()
      ]);

      const decimal = api.registry.chainDecimals[0];
      const token = api.registry.chainTokens[0];

      const consts = {
        bondingDuration,
        decimal,
        eraDuration: sessionsPerEra * epochDurationInHours, // eraDuration in hours
        eraIndex: Number(currentEraIndex?.toString() || '0'),
        existentialDeposit,
        maxNominations,
        maxNominatorRewardedPerValidator,
        minNominatorBond: new BN(minNominatorBond.toString()),
        token,
        unbondingDuration: bondingDuration * sessionsPerEra * epochDurationInHours / 24 // unbondingDuration in days
      };

      window.localStorage.setItem(`${chainName}_stakingConsts`, JSON.stringify(consts));
      setNewConsts(consts);
    } catch (error) {
      console.log('something went wrong while getStakingConsts. err: ', error);
      setNewConsts(null);
    }
  }, [api, chainName]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedStakingConsts = chainName && window.localStorage.getItem(`${chainName}_stakingConsts`);

    if (localSavedStakingConsts) {
      const parsedConsts = JSON.parse(localSavedStakingConsts) as StakingConsts;

      parsedConsts.existentialDeposit = new BN(parsedConsts.existentialDeposit);
      parsedConsts.minNominatorBond = new BN(parsedConsts.minNominatorBond);

      setSavedConsts(parsedConsts);
    }
  }, [chainName]);

  useEffect(() => {
    if (!eraIndex || !api || !chainName) {
      return;
    }

    const isSavedVersionOutOfDate = eraIndex !== savedConsts?.eraIndex;

    isSavedVersionOutOfDate && getStakingConsts().catch(console.error);
  }, [api, chainName, eraIndex, getStakingConsts, savedConsts?.eraIndex]);

  return newConsts ?? savedConsts ?? undefined;
}
