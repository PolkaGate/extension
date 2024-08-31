// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useCallback, useEffect, useState } from 'react';

import { AUTO_MODE } from '../util/constants';
import { EndpointManager, useGenesisHash } from '.';

interface EndpointType {
  checkForNewOne?: boolean;
  endpoint: string | undefined;
  timestamp: number | undefined;
  isOnManual: boolean | undefined;
}

// Create a singleton EndpointManager
const endpointManager = new EndpointManager();

export default function useEndpoint (address: AccountId | string | undefined, _endpoint?: string): EndpointType {
  const genesisHash = useGenesisHash(address);
  const [endpoint, setEndpoint] = useState<EndpointType>({
    checkForNewOne: undefined,
    endpoint: undefined,
    isOnManual: undefined,
    timestamp: undefined
  });

  // Function to fetch or update the endpoint
  const fetchEndpoint = useCallback(() => {
    if (!address || !genesisHash) {
      return;
    }

    // If an endpoint is provided, set it as manual
    if (_endpoint) {
      endpointManager.setEndpoint(String(address), genesisHash, {
        checkForNewOne: false,
        endpoint: _endpoint,
        isOnManual: true,
        timestamp: Date.now()
      });
    } else {
      // Otherwise, check for a saved endpoint or set to auto mode
      const savedEndpoint = endpointManager.getEndpoint(String(address), genesisHash);

      // If an endpoint already saved or it should be on  auto mode, then save the Auto Mode endpoint in the storage
      if (!savedEndpoint || endpointManager.shouldBeOnAutoMode(savedEndpoint)) {
        endpointManager.setEndpoint(String(address), genesisHash, {
          checkForNewOne: false,
          endpoint: AUTO_MODE.value,
          isOnManual: false,
          timestamp: Date.now()
        });
      }
    }

    // Update the local state with the current endpoint
    setEndpoint(endpointManager.getEndpoint(String(address), genesisHash) || {
      checkForNewOne: undefined,
      endpoint: undefined,
      isOnManual: undefined,
      timestamp: undefined
    });
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
