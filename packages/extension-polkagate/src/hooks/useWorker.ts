// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { WorkerContext } from '../components';

export const useWorker = () => {
  const worker = useContext(WorkerContext);

  if (worker === undefined) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }

  return worker;
};
