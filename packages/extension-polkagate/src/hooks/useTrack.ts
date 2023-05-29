// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { Track } from '../popup/governance/utils/types';
import { toSnakeCase } from '../popup/governance/utils/util';
import { useTracks } from '.';

export default function useTrack(address: string | undefined, trackName: string | undefined): Track | undefined {
  const { tracks } = useTracks(address);
  const snakeCaseTrackName = trackName && toSnakeCase(trackName);

  const track = useMemo(() => snakeCaseTrackName ? tracks?.find((t) => String(t?.[1].name) === snakeCaseTrackName) : undefined
    , [snakeCaseTrackName, tracks]);

  return track;
}
