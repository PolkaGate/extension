// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { WorkerContext } from '@polkadot/extension-polkagate/src/components/contexts';

interface WorkerProviderProps {
  children: React.ReactNode;
}

export default function WorkerProvider({ children }: WorkerProviderProps) {
  const [port, setPort] = useState<MessagePort | undefined>(undefined);

  useEffect(() => {
    const sharedWorker = new SharedWorker(new URL('@polkadot/extension-polkagate/src/util/workers/sharedWorker.js', import.meta.url));

    // Access the worker's communication port
    const workerPort = sharedWorker.port;

    // Start the port for communication
    workerPort.start();

    setPort(workerPort);

    return () => {
      // Cleanup on unmount
      if (workerPort) {
        workerPort.close();
      }
    };
  }, []);

  return (
    <WorkerContext.Provider value={port}>
      {children}
    </WorkerContext.Provider>
  );
}
