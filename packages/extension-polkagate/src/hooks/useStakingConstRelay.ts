// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { MAX_NOMINATIONS } from '../util/constants';
import { mapHubToRelay } from '../util/migrateHubUtils';
import useChainInfo from './useChainInfo';

export interface StakingConsts {
  maxNominations: number;
  epochDuration: number;
  expectedBlockTime: number;
}

export default function useStakingConstRelay (genesisHash: string | undefined) {
  const relayGenesisHash = mapHubToRelay(genesisHash);
  const { api: relayChainApi } = useChainInfo(relayGenesisHash);

  const [stakingConsts, setStakingConsts] = useState<StakingConsts | undefined>();

  useEffect(() => {
    if (!genesisHash || !relayChainApi) {
      return;
    }

    const fetConsts = async () => {
      const atRelay = await relayChainApi.rpc.chain.getFinalizedHead();
      const apiAtRelay = await relayChainApi.at(atRelay);

      const maxNominations = relayChainApi.consts['electionProviderMultiPhase']?.['minerMaxVotesPerVoter']?.toPrimitive() as number || MAX_NOMINATIONS;
      const epochDuration = apiAtRelay.consts['babe']['epochDuration'].toPrimitive() as number;
      const expectedBlockTime = relayChainApi.consts['babe']['expectedBlockTime'].toPrimitive() as number;

      return { epochDuration, expectedBlockTime, maxNominations };
    };

    fetConsts().then(setStakingConsts).catch(console.error);
  }, [genesisHash, relayChainApi]);

  return stakingConsts;
}
