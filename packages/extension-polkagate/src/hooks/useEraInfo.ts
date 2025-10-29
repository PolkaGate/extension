// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SessionIfo } from './useSoloStakingInfo';

import { useEffect, useState } from 'react';

import { toBN } from '@polkadot/extension-polkagate/src/util';

import { mapHubToRelay } from '../util/migrateHubUtils';
import useChainInfo from './useChainInfo';

export default function useEraInfo (genesisHash: string | null | undefined): SessionIfo | undefined {
  const relayGenesisHash = mapHubToRelay(genesisHash);
  const { api } = useChainInfo(genesisHash);
  const { api: relayChainApi } = useChainInfo(relayGenesisHash);

  const [sessionInfo, setSessionInfo] = useState<SessionIfo | undefined>(undefined);

  useEffect(() => {
    if (!relayChainApi || !genesisHash || !api) {
      setSessionInfo(undefined);

      return;
    }

    const fetch = async () => {
      const relaySessionProgress = await relayChainApi.derive.session.progress();
      const currentEra = await api.query['staking']['currentEra']();

      const expectedBlockTime = relayChainApi.consts['babe']['expectedBlockTime'];
      const blockTime = expectedBlockTime ? toBN(expectedBlockTime).toNumber() / 1000 : 6;

      const { currentIndex, eraLength, sessionLength, sessionProgress, sessionsPerEra } = relaySessionProgress;
      const currentEraSessionIndex = Number(currentIndex) % (Number(sessionsPerEra)) - 1;
      const eraProgress = Math.max(0, currentEraSessionIndex) * Number(sessionLength) + Number(sessionProgress);

      setSessionInfo({
        blockTime,
        currentEra: Number(currentEra),
        eraLength: Number(eraLength),
        eraProgress
      } as SessionIfo);
    };

    fetch().catch(console.error);
  }, [api, genesisHash, relayChainApi]);

  return sessionInfo;
}
