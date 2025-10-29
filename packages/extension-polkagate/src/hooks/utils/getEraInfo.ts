// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SessionIfo } from '../useSoloStakingInfo';

import { toBN } from '@polkadot/extension-polkagate/src/util';

import { mapHubToRelay } from '../../util/migrateHubUtils';
import { fastestApi } from '../../util/workers/utils';

export const getEraInfo = async (api: ApiPromise): Promise<SessionIfo> => {
  const relayGenesisHash = mapHubToRelay(api.genesisHash.toHex());
  const { api: relayChainApi } = await fastestApi(relayGenesisHash);

  const relaySessionProgress = await relayChainApi.derive.session.progress();
  const currentEra = await api.query['staking']['currentEra']();

  const expectedBlockTime = relayChainApi.consts['babe']['expectedBlockTime'];
  const blockTime = expectedBlockTime ? toBN(expectedBlockTime).toNumber() / 1000 : 6;

  const { currentIndex, eraLength, sessionLength, sessionProgress, sessionsPerEra } = relaySessionProgress;
  const currentEraSessionIndex = Number(currentIndex) % (Number(sessionsPerEra)) - 1;
  const eraProgress = Math.max(0, currentEraSessionIndex) * Number(sessionLength) + Number(sessionProgress);

  return {
    blockTime,
    currentEra: Number(currentEra),
    eraLength: Number(eraLength),
    eraProgress
  } as SessionIfo;
};
