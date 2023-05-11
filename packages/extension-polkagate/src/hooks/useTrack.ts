// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { useMemo } from 'react';

import { BN } from '@polkadot/util';

import { toSnakeCase } from '../popup/governance/utils/util';
import { useTracks } from '.';

export type Track = [
  id: BN,
  info: PalletReferendaTrackInfo
]

export default function useTrack(address: string | undefined, trackName: string | undefined): Track | undefined {
  const tracks = useTracks(address);
  const snakeCaseTrackName = trackName && toSnakeCase(trackName);

  const track = useMemo(() => snakeCaseTrackName ? tracks?.find((t) => String(t?.[1].name) === snakeCaseTrackName) : undefined
    , [snakeCaseTrackName, tracks]);

  return track;
}
