// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomEndpoints } from '../util/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEY } from '../util/constants';
import { getAndWatchStorage, getStorage, setStorage, updateStorage } from '../util/storage';

export default function useCustomEndpoint(genesisHash: string | null | undefined) {
  const [customEndpoints, setCustomEndpoints] = useState<CustomEndpoints>({});

  useEffect(() => {
    return getAndWatchStorage<CustomEndpoints>(
      STORAGE_KEY.CUSTOM_ENDPOINTS,
      (value) => setCustomEndpoints(value ?? {}),
      false,
      {}
    );
  }, []);

  const customEndpoint = useMemo(() =>
    genesisHash ? customEndpoints[genesisHash] : undefined,
    [customEndpoints, genesisHash]
  );

  const setCustomEndpoint = useCallback(async(endpoint: string): Promise<boolean> => {
    if (!genesisHash) {
      return false;
    }

    return updateStorage(STORAGE_KEY.CUSTOM_ENDPOINTS, { [genesisHash]: endpoint });
  }, [genesisHash]);

  const removeCustomEndpoint = useCallback(async(): Promise<boolean> => {
    if (!genesisHash) {
      return false;
    }

    const latestCustomEndpoints = await getStorage(STORAGE_KEY.CUSTOM_ENDPOINTS) as CustomEndpoints | undefined;
    const updated = { ...(latestCustomEndpoints ?? {}) };

    delete updated[genesisHash];

    return setStorage(STORAGE_KEY.CUSTOM_ENDPOINTS, updated);
  }, [genesisHash]);

  return { customEndpoint, removeCustomEndpoint, setCustomEndpoint };
}
