// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useMemo } from 'react';

import { Track } from '../fullscreen/governance/utils/types';
import { toSnakeCase } from '../fullscreen/governance/utils/util';
import { useTracks } from '.';

export default function useTrack(address: string | undefined, trackName: string | undefined): Track | undefined {
  const { fellowshipTracks, tracks } = useTracks(address);
  const snakeCaseTrackName = trackName && toSnakeCase(trackName);

  const track = useMemo((): string | undefined => snakeCaseTrackName
    ? tracks?.find((t) =>
      String(t?.[1].name) === snakeCaseTrackName) || fellowshipTracks?.find((t) => String(t?.[1].name) === snakeCaseTrackName
      )
    : undefined
    , [fellowshipTracks, snakeCaseTrackName, tracks]);

  return track;
}
