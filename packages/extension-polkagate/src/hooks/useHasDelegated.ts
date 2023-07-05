// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletConvictionVotingVoteVoting } from '@polkadot/types/lookup';

import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import useApi from './useApi';
import useFormatted from './useFormatted';
import { useChain, useTracks } from '.';

export default function useHasDelegated(address: string | undefined, refresh?: boolean): BN | null | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const { tracks } = useTracks(address);

  const [hasDelegated, setHasDelegated] = useState<BN | null>();

  useEffect(() => {
    if (refresh) {
      setHasDelegated(undefined);
    }

    if (!api || !formatted || !tracks || !tracks?.length || !api?.query?.convictionVoting) {
      return;
    }

    if (chain?.genesisHash && api && api.genesisHash.toString() !== chain.genesisHash) {
      return;
    }

    const params: [string, BN][] = tracks.map((t) => [String(formatted), t[0]]);

    // eslint-disable-next-line no-void
    void api.query.convictionVoting.votingFor.multi(params).then((votingFor: PalletConvictionVotingVoteVoting[]) => {
      let maxDelegated = BN_ZERO;

      votingFor?.filter((v) => v.isDelegating).forEach((v) => {
        if (v.asDelegating.balance.gt(maxDelegated)) {
          maxDelegated = v.asDelegating.balance;
        }
      });

      maxDelegated.isZero() ? setHasDelegated(null) : setHasDelegated(maxDelegated);
    });
  }, [api, chain?.genesisHash, formatted, tracks, refresh]);

  return hasDelegated;
}
