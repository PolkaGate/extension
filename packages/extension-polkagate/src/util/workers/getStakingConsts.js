// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */

// @ts-nocheck

import { MAX_NOMINATIONS } from '../constants';
import getApi from '../getApi.ts';

async function getStakingConsts(endpoint) {
  try {
    const api = await getApi(endpoint);
    const at = await api.rpc.chain.getFinalizedHead();
    const apiAt = await api.at(at);

    const maxNominations = apiAt.consts.staking.maxNominations?.toNumber() || MAX_NOMINATIONS;
    // TODO: apiAt.consts.staking.maxNominatorRewardedPerValidator is deprecated
    const maxNominatorRewardedPerValidator = (apiAt.consts.staking.maxNominatorRewardedPerValidator || apiAt.consts.staking.maxExposurePageSize).toNumber();
    const existentialDeposit = apiAt.consts.balances.existentialDeposit.toString();
    const bondingDuration = apiAt.consts.staking.bondingDuration.toNumber();
    const sessionsPerEra = apiAt.consts.staking.sessionsPerEra.toNumber();
    const epochDuration = apiAt.consts.babe.epochDuration.toNumber();
    const expectedBlockTime = api.consts.babe.expectedBlockTime.toNumber();
    const epochDurationInHours = epochDuration * expectedBlockTime / 3600000; // 1000 milSec * 60sec * 60min
    const [minNominatorBond, currentEraIndex] = await Promise.all([
      apiAt.query.staking.minNominatorBond(),
      api.query.staking.currentEra()
    ]);

    const token = api.registry.chainTokens[0];

    return {
      bondingDuration,
      eraIndex: Number(currentEraIndex?.toString() || '0'),
      existentialDeposit,
      maxNominations,
      maxNominatorRewardedPerValidator,
      minNominatorBond: minNominatorBond.toString(),
      token,
      unbondingDuration: bondingDuration * sessionsPerEra * epochDurationInHours / 24 // unbondingDuration in days
    };
  } catch (error) {
    console.log('something went wrong while getStakingConsts. err: ' + error);

    return null;
  }
}

onmessage = (e) => {
  const { endpoint } = e.data;

  getStakingConsts(endpoint)
    .then((consts) => {
      postMessage(consts);
    }).catch(console.error);
};
