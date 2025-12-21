// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

export default function usePendingRewardsProgress () {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<number>;

      setProgress(customEvent.detail);
    };

    window.addEventListener(
      'percentOfErasCheckedForPendingRewards',
      handler
    );

    return () => {
      window.removeEventListener(
        'percentOfErasCheckedForPendingRewards',
        handler
      );
    };
  }, []);

  return progress;
}
