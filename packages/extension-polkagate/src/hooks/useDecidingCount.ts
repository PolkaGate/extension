// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

type DecidingCount = [string, number];

export default function useDecidingCount(api: ApiPromise | undefined, tracks: [string, { name: string }][] | undefined): DecidingCount[] | undefined {
  const [counts, setCounts] = useState<DecidingCount[] | undefined>(undefined);
  const trackIds = useMemo(() => tracks?.map(([id, { name }]) => [id, name]), [tracks]);

  useEffect(() => {
    async function fetchDecidingCounts() {
      if (!trackIds || !api) {
        return;
      }

      try {
        const counts = await Promise.all(trackIds.map(([id]) => api.query.referenda.decidingCount(id)));
        const decidingCounts: DecidingCount[] = counts.map((count, index) => [
          trackIds[index][1],
          count.toNumber()
        ]);

        setCounts(decidingCounts);
      } catch (error) {
        console.error(error);
      }
    }

    fetchDecidingCounts();
  }, [api, trackIds]);

  return counts;
}
