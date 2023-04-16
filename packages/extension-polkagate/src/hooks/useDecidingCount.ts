// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import useApi from './useApi';
import useTracks from './useTracks';

export type DecidingCount = [string, number];

export default function useDecidingCount(address: string): DecidingCount[] | undefined {
  const api = useApi(address);
  const tracks = useTracks(address);

  const [counts, setCounts] = useState<DecidingCount[] | undefined>(undefined);
  const trackIds = useMemo(() => tracks?.map(([id, { name }]) => [id, name]), [tracks]);

  useEffect(() => {
    async function fetchDecidingCounts() {
      if (!trackIds || !api) {
        return;
      }

      try {
        const counts = await Promise.all(trackIds.map(([id]) => api.query.referenda.decidingCount(id)));
        let allCount = 0;
        const decidingCounts: DecidingCount[] = counts.map((count, index): DecidingCount => {
          if (!['whitelisted_caller', 'fellowship_admin'].includes(trackIds[index][1])) {
            allCount += count.toNumber();
          }

          return [String(trackIds[index][1]), count.toNumber() as number];
        });

        decidingCounts.push(['all', allCount]);
        setCounts(decidingCounts);
      } catch (error) {
        console.error(error);
      }
    }

    fetchDecidingCounts();
  }, [api, trackIds]);

  return counts;
}
