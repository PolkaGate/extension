// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option, u32 } from '@polkadot/types';
// @ts-ignore
import type { PalletStakingActiveEraInfo } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { EraInfo } from './useSoloStakingInfo';

import { useEffect, useState } from 'react';

import { toBN } from '@polkadot/extension-polkagate/src/util';

import { mapHubToRelay } from '../util/migrateHubUtils';
import useChainInfo from './useChainInfo';

export default function useEraInfo(genesisHash: string | null | undefined): EraInfo | undefined {
  const relayGenesisHash = mapHubToRelay(genesisHash);
  const { api } = useChainInfo(genesisHash);
  const { api: rcApi } = useChainInfo(relayGenesisHash);

  const [info, setInfo] = useState<EraInfo | undefined>(undefined);

  useEffect(() => {
    if (!rcApi || !genesisHash || !api) {
      setInfo(undefined);

      return;
    }

    (async () => {
      const activeEraRaw = (await api.query['staking']['activeEra']()) as Option<PalletStakingActiveEraInfo>;

      if (activeEraRaw.isNone) {
        console.warn('Active era not available');

        return;
      }

      const { index, start } = activeEraRaw.unwrap();

      const activeEraIndex = index.toNumber();

      const activeEraStart = start.isSome ? start.unwrap().toNumber() : undefined;

      if (!activeEraStart) {
        console.warn('Active era start time not available');

        return;
      }

      const sessionsPerEra = (rcApi.consts['staking']['sessionsPerEra'] as unknown as BN).toNumber();
      const sessionLength = (rcApi.consts['babe']['epochDuration'] as unknown as BN).toNumber(); // in blocks
      const currentSessionIndex = (await rcApi.query['session']['currentIndex']() as unknown as BN).toNumber();

      const expectedBlockTime = rcApi.consts['babe']?.['expectedBlockTime'] ||
        (rcApi.consts['timestamp']?.['minimumPeriod'] as unknown as BN).muln(2);

      const blockTime = expectedBlockTime ? toBN(expectedBlockTime).toNumber() / 1000 : 6;

      const eraLength = sessionsPerEra * sessionLength;

      const bondedEras = (await api.query['staking']['bondedEras']()) as unknown as [u32, u32][];
      const activeEraStartSession = bondedEras.find(([e]) => e.eqn(activeEraIndex))?.[1];

      if (!activeEraStartSession) {
        console.warn('Active era not found in bonded eras');

        return;
      }

      const activeEraStartSessionIndex = activeEraStartSession.toNumber();
      // const lastSessionReportEndIndex = await api.query['stakingRcClient']['lastSessionReportEndingIndex']() as Option<BlockNumber>;
      // const lastSessionIndex = lastSessionReportEndIndex.isSome ? lastSessionReportEndIndex.unwrap().toNumber() + 1 : 0;

      const currentBlock = (await rcApi.rpc.chain.getHeader()).number.toNumber();
      const sessionProgress = currentBlock % sessionLength;
      const currentEraSessionIndex = currentSessionIndex - activeEraStartSessionIndex;

      const eraProgress = currentEraSessionIndex * sessionLength + sessionProgress;

      const activeEraDuration = Date.now() - activeEraStart;
      const progressPercent = activeEraDuration / (eraLength * blockTime * 10); // *1/10= *100/1000

      setInfo({
        activeEra: Number(activeEraIndex),
        activeEraDuration,
        blockTime,
        eraLength,
        eraProgress,
        progressPercent,
        sessionLength,
        sessionProgress
      } as EraInfo);
    })().catch(console.error);
  }, [api, genesisHash, rcApi]);

  return info;
}
