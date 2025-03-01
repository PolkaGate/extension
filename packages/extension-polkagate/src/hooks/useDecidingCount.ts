// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { u32 } from '@polkadot/types';
import type { BN } from '@polkadot/util';
import type { Track } from '../fullscreen/governance/utils/types';

import { useEffect, useMemo, useState } from 'react';

import useInfo from './useInfo';
import useTracks from './useTracks';

type TrackId = [BN, string];
export type Count = [string, number];

export interface DecidingCount {
  referenda: Count[];
  fellowship: Count[];
}

/**
 * Custom hook to fetch and track deciding counts for referenda and fellowship
 * @param address - The account address to fetch counts for
 * @returns DecidingCount object containing referenda and fellowship counts
 */
export default function useDecidingCount(address: string | undefined): DecidingCount | undefined {
  const { api, chain } = useInfo(address);
  const { fellowshipTracks, tracks } = useTracks(address);
  const [counts, setCounts] = useState<DecidingCount | undefined>(undefined);

  const trackIds: TrackId[] | undefined = useMemo(() => tracks?.map(([id, { name }]) => [id, name.toString()]), [tracks]);
  const fellowshipTrackIds: TrackId[] | undefined = useMemo(() => fellowshipTracks?.map(([id, { name }]) => [id, name.toString()]), [fellowshipTracks]);

  useEffect(() => {
    if (chain?.genesisHash !== api?.genesisHash?.toString()) {
      setCounts(undefined);

      return;
    }

    async function fetchDecidingCounts() {
      if ((!trackIds && !fellowshipTrackIds) || !api) {
        return;
      }

      try {
        const result = await fetchCounts(api, trackIds, fellowshipTrackIds, fellowshipTracks);

        setCounts(result);
      } catch (error) {
        console.error('Failed to fetch deciding counts:', error);
        setCounts(undefined);
      }
    }

    fetchDecidingCounts().catch(console.error);
  }, [api, chain?.genesisHash, fellowshipTrackIds, fellowshipTracks, trackIds]);

  return counts;
}

/**
 * Helper function to fetch and process counts from the API
 */
async function fetchCounts(
  api: ApiPromise,
  trackIds: TrackId[] | undefined,
  fellowshipTrackIds: TrackId[] | undefined,
  fellowshipTracks: Track[] | undefined
): Promise<DecidingCount> {
  const fellowshipDecidingCounts: Count[] = [];
  let decidingCounts: Count[] = [];

  if (trackIds) {
    const counts = await Promise.all(
      trackIds.map(([id]) => api.query['referenda']['decidingCount'](id))
    ) as unknown as u32[];

    let allCount = 0;

    decidingCounts = counts
      .map((count, index) => {
        const countValue = count.toNumber();
        const trackName = String(trackIds[index][1]);

        if (!['whitelisted_caller', 'fellowship_admin'].includes(trackName)) {
          allCount += countValue;

          return [trackName, countValue];
        } else {
          fellowshipDecidingCounts.push([trackName, countValue]);

          return undefined;
        }
      })
      .filter((item): item is Count => !!item);

    decidingCounts.push(['all', allCount]);
  }

  if (fellowshipTrackIds && fellowshipTracks) {
    const fellowshipCounts = await Promise.all(
      fellowshipTracks.map(([id]) =>
        api.query['fellowshipReferenda']['decidingCount'](id)
      )
    ) as unknown as u32[];

    let fellowshipAllCount = 0;
    const counts = fellowshipCounts.map((count, index) => {
      const countValue = count.toNumber();

      fellowshipAllCount += countValue;

      return [String(fellowshipTrackIds[index][1]), countValue] as Count;
    });

    fellowshipDecidingCounts.push(...counts);
    fellowshipDecidingCounts.push(['all', fellowshipAllCount]);
  } else if (fellowshipDecidingCounts.length) {
    const allCount = fellowshipDecidingCounts.reduce((acc, item) => {
      return acc + item[1];
    }, 0);

    fellowshipDecidingCounts.push(['all', allCount]);
  }

  return {
    fellowship: fellowshipDecidingCounts,
    referenda: decidingCounts
  };
}
