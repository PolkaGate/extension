// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
//@ts-ignore
import type { PalletStakingActiveEraInfo } from '@polkadot/types/lookup';
import type { EraInfo } from './useSoloStakingInfo';

import { useEffect, useState } from 'react';

import { toBN } from '@polkadot/extension-polkagate/src/util';
import { BN_ZERO } from '@polkadot/util';

import { mapHubToRelay } from '../util/migrateHubUtils';
import useChainInfo from './useChainInfo';

export default function useEraInfo (genesisHash: string | null | undefined): EraInfo | undefined {
  const relayGenesisHash = mapHubToRelay(genesisHash);
  const { api } = useChainInfo(genesisHash);
  const { api: relayChainApi } = useChainInfo(relayGenesisHash);

  const [info, setInfo] = useState<EraInfo | undefined>(undefined);

  useEffect(() => {
    if (!relayChainApi || !genesisHash || !api) {
      setInfo(undefined);

      return;
    }

    (async () => {
      const relaySessionProgress = await relayChainApi.derive.session.progress();
      const activeEra = (await api.query['staking']['activeEra']()) as Option<PalletStakingActiveEraInfo>;
      const activeEraIndex = activeEra.unwrapOr({ index: BN_ZERO }).index;

      const expectedBlockTime = relayChainApi.consts['babe']['expectedBlockTime'];
      const blockTime = expectedBlockTime ? toBN(expectedBlockTime).toNumber() / 1000 : 6;

      const { currentIndex, eraLength, sessionLength, sessionProgress, sessionsPerEra } = relaySessionProgress;
      const currentEraSessionIndex = Number(currentIndex) % (Number(sessionsPerEra));
      const eraProgress = Math.max(0, currentEraSessionIndex) * Number(sessionLength) + Number(sessionProgress);

      setInfo({
        activeEra: Number(activeEraIndex),
        blockTime,
        eraLength: Number(eraLength),
        eraProgress
      } as EraInfo);
    })().catch(console.error);
  }, [api, genesisHash, relayChainApi]);

  return info;
}
