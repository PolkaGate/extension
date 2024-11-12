// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u32 } from '@polkadot/types';

import { useEffect, useMemo, useState } from 'react';

import useInfo from './useInfo';
import useTracks from './useTracks';

export type Count = [string, number];

export interface DecidingCount {
  referenda: Count[];
  fellowship: Count[];
}

export default function useDecidingCount (address: string | undefined): DecidingCount | undefined {
  const { api, chain } = useInfo(address);

  const { fellowshipTracks, tracks } = useTracks(address);

  const [counts, setCounts] = useState<DecidingCount | undefined>(undefined);
  const trackIds = useMemo(() => tracks?.map(([id, { name }]) => [id, name]), [tracks]);
  const fellowshipTrackIds = useMemo(() => fellowshipTracks?.map(([id, { name }]) => [id, name]), [fellowshipTracks]);

  useEffect(() => {
    async function fetchDecidingCounts () {
      if ((!trackIds && !fellowshipTrackIds) || !api) {
        return;
      }

      try {
        let allCount = 0;
        const fellowshipDecidingCounts: Count[] = [];
        let decidingCounts: Count[] = [];
        let fellowshipCounts;

        if (trackIds) {
          const counts = await Promise.all(trackIds.map(([id]) => api.query['referenda']['decidingCount'](id))) as unknown as u32[];

          decidingCounts = counts.map((count, index) => {
            const _count = count.toNumber();

            if (!['whitelisted_caller', 'fellowship_admin'].includes(trackIds[index][1] as unknown as string)) {
              allCount += _count;
            } else {
              fellowshipDecidingCounts.push([String(trackIds[index][1]), _count]);
            }

            return [String(trackIds[index][1]), _count];
          });

          decidingCounts.push(['all', allCount]);
        }

        if (fellowshipTrackIds && fellowshipTracks) {
          fellowshipCounts = await Promise.all(fellowshipTracks.map(([id]) => api.query['fellowshipReferenda']['decidingCount'](id))) as unknown as u32[];

          allCount = 0;
          const counts = fellowshipCounts.map((c, index) => {
            allCount += c.toNumber();

            return [String(fellowshipTrackIds[index][1]), c.toNumber()] as [string, number];
          });

          fellowshipDecidingCounts.push(...counts);
          fellowshipDecidingCounts.push(['all', allCount]);
        }

        setCounts({ fellowship: fellowshipDecidingCounts, referenda: decidingCounts });
      } catch (error) {
        console.error(error);
      }
    }

    if (chain?.genesisHash !== api?.genesisHash?.toString()) {
      setCounts(undefined);

      return;
    }

    fetchDecidingCounts().catch(console.error);
  }, [api, chain?.genesisHash, fellowshipTrackIds, fellowshipTracks, trackIds]);

  return counts;
}
