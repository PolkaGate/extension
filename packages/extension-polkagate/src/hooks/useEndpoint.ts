// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { ChromeStorageGetResponse } from '../util/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AUTO_MODE, NO_PASS_PERIOD as ENDPOINT_TIMEOUT } from '../util/constants';
import { useChainName } from '.';

interface EndpointType {
  endpoint: string | undefined;
  timestamp: number | undefined;
}

export default function useEndpoint(address: AccountId | string | undefined, _endpoint?: string): EndpointType {
  const chainName = useChainName(address);
  const [endpoint, setEndpoint] = useState<EndpointType>({ endpoint: undefined, timestamp: undefined });
  const initialFetchDone = useRef(false);

  const isEndpointValid = useCallback((toCheck: EndpointType | undefined): boolean =>
    !!toCheck &&
    typeof toCheck.timestamp === 'number' &&
    typeof toCheck.endpoint === 'string' &&
    Date.now() - toCheck.timestamp <= ENDPOINT_TIMEOUT,
    []);

  const fetchEndpoint = useCallback(async () => {
    if (!address || !chainName) {
      setEndpoint({ endpoint: undefined, timestamp: undefined });

      return;
    }

    try {
      const res = await chrome.storage.local.get('endpoints') as { endpoints?: ChromeStorageGetResponse };
      const savedEndpoints: ChromeStorageGetResponse = res.endpoints || {};
      const addressKey = String(address);

      savedEndpoints[addressKey] = savedEndpoints[addressKey] || {};

      if (!savedEndpoints[addressKey][chainName] || !isEndpointValid(savedEndpoints[addressKey][chainName])) {
        const auto = {
          endpoint: AUTO_MODE.value,
          timestamp: Date.now()
        };

        savedEndpoints[addressKey][chainName] = auto;

        await chrome.storage.local.set({ endpoints: savedEndpoints });
        setEndpoint(auto);
      } else {
        setEndpoint({
          endpoint: savedEndpoints[addressKey][chainName].endpoint,
          timestamp: savedEndpoints[addressKey][chainName].timestamp
        });
      }
    } catch (error) {
      console.error('Error fetching or setting endpoint:', error);
    } finally {
      initialFetchDone.current = true;
    }
  }, [address, chainName, isEndpointValid]);

  useEffect(() => {
    if (_endpoint) {
      setEndpoint({ endpoint: _endpoint, timestamp: Date.now() });
      initialFetchDone.current = true;
    } else {
      fetchEndpoint().catch(console.error);
    }
  }, [_endpoint, fetchEndpoint]);

  // @ts-ignore
  useEffect(() => {
    if (address && chainName && initialFetchDone.current) {
      const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, namespace: string) => {
        if (changes['endpoints'] && namespace === 'local') {
          const newValue = changes['endpoints'].newValue as ChromeStorageGetResponse | undefined;
          const maybeNewEndpoint = newValue?.[String(address)]?.[chainName];

          if (maybeNewEndpoint) {
            setEndpoint({ endpoint: maybeNewEndpoint.endpoint, timestamp: maybeNewEndpoint.timestamp });
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainName, initialFetchDone.current]);

  return endpoint;
}
