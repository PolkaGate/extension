// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointType } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import EndpointManager from '../class/endpointManager';
import { AUTO_MODE_DEFAULT_ENDPOINT } from '../util/constants';

// Create a singleton EndpointManager
const endpointManager = new EndpointManager();

const DEFAULT_ENDPOINT = {
  checkForNewOne: undefined,
  endpoint: undefined,
  isAuto: undefined,
  timestamp: undefined
};

export default function useEndpoint (genesisHash: string | null | undefined, _endpoint?: string): EndpointType {
  const [endpoint, setEndpoint] = useState<EndpointType>(DEFAULT_ENDPOINT);

  // Function to fetch or update the endpoint
  const fetchEndpoint = useCallback(() => {
    if (!genesisHash) {
      return;
    }

    // If an endpoint is provided, set it as manual
    if (_endpoint) {
      endpointManager.set(genesisHash, {
        checkForNewOne: false,
        endpoint: _endpoint,
        isAuto: false,
        timestamp: Date.now()
      });
    } else {
      // Otherwise, check for a saved endpoint or set to auto mode
      const savedEndpoint = endpointManager.get(genesisHash);

      // If an endpoint already saved or it should be on auto mode, then save the Auto Mode endpoint in the storage
      if (!savedEndpoint || endpointManager.shouldBeOnAutoMode(savedEndpoint)) {
        endpointManager.set(genesisHash, { ...AUTO_MODE_DEFAULT_ENDPOINT, timestamp: Date.now() });
      }
    }

    // Update the local state with the current endpoint
    const maybeExistingEndpoint = endpointManager.get(genesisHash);

    setEndpoint(maybeExistingEndpoint || DEFAULT_ENDPOINT);
  }, [genesisHash, _endpoint]);

  useEffect(() => {
    fetchEndpoint();

    // Handler for endpoint changes
    const handleEndpointChange = (changedGenesisHash: string, newEndpoint: EndpointType) => {
      if (changedGenesisHash === genesisHash) {
        setEndpoint(newEndpoint);
      }
    };

    endpointManager.subscribe(handleEndpointChange);

    return () => {
      endpointManager.unsubscribe(handleEndpointChange);
    };
  }, [genesisHash, fetchEndpoint]);

  return endpoint;
}
