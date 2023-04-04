// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

export default function useDecidingCount(api: ApiPromise, tracks: string[] | undefined): undefined | string[] {
  const [counts, setCounts] = useState();
  const trackIds = useMemo(() => tracks?.map((t) => [t[0], t[1].name]), [tracks]);

  useEffect(() => {
    if (!trackIds || !api) {
      return;
    }

    call().catch(console.error);

    async function call() {
      const counts = await Promise.all(trackIds.map((t) => api.query.referenda.decidingCount(t[0])));

      setCounts(counts);
    }
  }, [api, trackIds]);

  return counts && trackIds && counts.map((c, index) => [trackIds[index][1], c.toNumber()]);
}
