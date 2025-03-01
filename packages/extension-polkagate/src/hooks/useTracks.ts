// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Track } from '../fullscreen/governance/utils/types';

import { useMemo } from 'react';

import { useInfo } from '.';

interface TracksType { fellowshipTracks: Track[] | undefined, tracks: Track[] | undefined }

export default function useTracks(address: string | undefined): TracksType {
  const { api, chain } = useInfo(address);

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
