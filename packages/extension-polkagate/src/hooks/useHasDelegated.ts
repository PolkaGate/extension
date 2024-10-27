// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
//@ts-ignore
import type { PalletConvictionVotingVoteVoting } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { useEffect, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { useInfo, useTracks } from '.';

export default function useHasDelegated (address: string | undefined, refresh?: boolean): BN | null | undefined {
  const { api, chain, formatted } = useInfo(address);
  const { tracks } = useTracks(address);

  const [hasDelegated, setHasDelegated] = useState<BN | null>();
  const [fetchedFor, setFetchedFor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (refresh) {
      setHasDelegated(undefined);
      setFetchedFor(undefined);
    }

    if (!api || !formatted || !tracks?.length || !api?.query?.['convictionVoting'] || fetchedFor === address) {
      return;
    }

    if (chain?.genesisHash && api && api.genesisHash.toString() !== chain.genesisHash) {
      return;
    }

    const fetchDelegationData = async (
      api: ApiPromise,
      formatted: string,
      tracks: [BN, unknown][]
    ): Promise<void> => {
      try {
        setFetchedFor(address);

        const params: [string, BN][] = tracks.map((t) => [formatted, t[0]]);
        const votingFor: PalletConvictionVotingVoteVoting[] = await api.query['convictionVoting']['votingFor'].multi(params);

        const maxDelegated = votingFor
          .filter((v) => v.isDelegating)
          .reduce((max, v) => {
            const balance = v.asDelegating.balance;

            return balance.gt(max) ? balance : max;
          }, BN_ZERO);

        setHasDelegated(maxDelegated.isZero() ? null : maxDelegated);
      } catch (error) {
        console.error('Error fetching delegation data:', error);
        setFetchedFor(undefined);
      }
    };

    fetchDelegationData(api, formatted, tracks).catch(console.error);
  }, [api, chain?.genesisHash, formatted, tracks, refresh, fetchedFor, address]);

  return hasDelegated;
}
