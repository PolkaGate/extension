// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { EndpointType } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import EndpointManager from '../class/endpointManager';
import { AUTO_MODE } from '../util/constants';
import { useGenesisHash } from '.';

// Create a singleton EndpointManager
const endpointManager = new EndpointManager();

const DEFAULT_ENDPOINT = {
  checkForNewOne: undefined,
  endpoint: undefined,
  isAuto: undefined,
  timestamp: undefined
};

export default function useEndpoint(address: AccountId | string | undefined, _endpoint?: string): EndpointType {
  const genesisHash = useGenesisHash(address);
  const [endpoint, setEndpoint] = useState<EndpointType>(DEFAULT_ENDPOINT);

  // Function to fetch or update the endpoint
  const fetchEndpoint = useCallback(() => {
    if (!address || !genesisHash) {
      return;
    }

    // If an endpoint is provided, set it as manual
    if (_endpoint) {
      endpointManager.set(String(address), genesisHash, {
        checkForNewOne: false,
        endpoint: _endpoint,
        isAuto: false,
        timestamp: Date.now()
      });
    } else {
      // Otherwise, check for a saved endpoint or set to auto mode
      const savedEndpoint = endpointManager.get(String(address), genesisHash);

      // If an endpoint already saved or it should be on auto mode, then save the Auto Mode endpoint in the storage
      if (!savedEndpoint || endpointManager.shouldBeOnAutoMode(savedEndpoint)) {
        endpointManager.set(String(address), genesisHash, {
          checkForNewOne: false,
          endpoint: AUTO_MODE.value,
          isAuto: true,
          timestamp: Date.now()
        });
      }
    }

    // Update the local state with the current endpoint
    const maybeExistingEndpoint = endpointManager.get(String(address), genesisHash);

    setEndpoint(maybeExistingEndpoint || DEFAULT_ENDPOINT);
  }, [address, genesisHash, _endpoint]);

  useEffect(() => {
    fetchEndpoint();

    // Handler for endpoint changes
    const handleEndpointChange = (changedAddress: string, changedGenesisHash: string, newEndpoint: EndpointType) => {
      if (changedAddress === String(address) && changedGenesisHash === genesisHash) {
        setEndpoint(newEndpoint);
      }
    };

    endpointManager.subscribe(handleEndpointChange);

    return () => {
      endpointManager.unsubscribe(handleEndpointChange);
    };
  }, [address, genesisHash, fetchEndpoint]);

  return endpoint;
}
