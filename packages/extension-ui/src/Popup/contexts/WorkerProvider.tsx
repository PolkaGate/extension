// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { WorkerContext } from '@polkadot/extension-polkagate/src/components/contexts';

interface WorkerProviderProps {
  children: React.ReactNode;
}

export default function WorkerProvider ({ children }: WorkerProviderProps) {
  const [worker, setWorker] = useState<Worker | undefined>(undefined);

  useEffect(() => {
    const newWorker = new Worker(new URL('@polkadot/extension-polkagate/src/util/workers/sharedWorker.js', import.meta.url));

    setWorker(newWorker);

    return () => {
      // Cleanup on unmount
      if (newWorker) {
        newWorker.terminate();
      }
    };
  }, []);

  return (
    <WorkerContext.Provider value={worker}>
      {children}
    </WorkerContext.Provider>
  );
}
