// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import type { Track } from '../fullscreen/governance/utils/types';
import { useApi, useChain } from '.';

export default function useTracks(address: string | undefined): { fellowshipTracks: Track[], tracks: Track[] } | undefined {
  const api = useApi(address);
  const chain = useChain(address);

  const tracks = useMemo(() => {
    if (chain?.genesisHash !== api?.genesisHash?.toString()) {
      return {
        fellowshipTracks: undefined,
        tracks: undefined
      };
    }

    return {
      fellowshipTracks: api?.consts?.['fellowshipReferenda']?.['tracks'] as unknown as Track[],
      tracks: api?.consts?.['referenda']?.['tracks'] as unknown as Track[]
    };
  }, [api, chain?.genesisHash]);

  return tracks as any;
}
