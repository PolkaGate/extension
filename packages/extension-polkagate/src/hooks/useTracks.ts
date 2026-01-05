// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Track } from '../fullscreen/governance/types';

import { useMemo } from 'react';

import useChainInfo from './useChainInfo';

interface TracksType { fellowshipTracks: Track[] | undefined, tracks: Track[] | undefined }

export default function useTracks (genesisHash: string | null | undefined): TracksType {
  const { api, chain } = useChainInfo(genesisHash);

  const tracks: TracksType = useMemo(() => {
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

  return tracks;
}
