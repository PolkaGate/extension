// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { ChromeStorageGetResponse, savedEndpoint } from '../util/types';

import { useEffect, useState } from 'react';

import { AUTO_MODE, NO_PASS_PERIOD as ENDPOINT_TIMEOUT } from '../util/constants';
import { useChainName, useTranslation } from '.';

interface EndpointType {
  endpoint: string | undefined;
  timestamp: number | undefined;
}

export default function useEndpoint (address: AccountId | string | undefined, _endpoint?: string): EndpointType {
  const chainName = useChainName(address);
  const { t } = useTranslation();
  const [endpoint, setEndpoint] = useState<EndpointType>({ endpoint: undefined, timestamp: undefined });

  useEffect(() => {
    if (_endpoint) {
      setEndpoint({ endpoint: _endpoint, timestamp: Date.now() });

      return;
    }

    if (!address || !chainName) {
      setEndpoint({ endpoint: undefined, timestamp: undefined });

      return;
    }

    chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
      const i = `${String(address)}`;
      const j = `${chainName}`;

      const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

      savedEndpoints[i] = savedEndpoints[i] || {};

      const isEndpointValid = (toCheck: EndpointType | undefined) =>
        toCheck &&
        typeof toCheck.timestamp === 'number' &&
        typeof toCheck.endpoint === 'string' &&
        Date.now() - toCheck.timestamp <= ENDPOINT_TIMEOUT;

      if (!savedEndpoints[i][j] || !isEndpointValid(savedEndpoints[i][j])) {
        savedEndpoints[i][j] = {
          endpoint: AUTO_MODE.value,
          timestamp: Date.now()
        };

        chrome.storage.local.set({ endpoints: savedEndpoints })
          .then(() => setEndpoint({ endpoint: AUTO_MODE.value, timestamp: 0 }))
          .catch(console.error);
      } else {
        setEndpoint({ endpoint: savedEndpoints[i][j].endpoint, timestamp: savedEndpoints[i][j].timestamp });
      }
    });
  }, [_endpoint, address, chainName, t]);

  useEffect(() => {
    address && chainName && chrome.storage.onChanged.addListener((changes, namespace) => {
      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key === 'endpoints' && namespace === 'local') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const maybeNewEndpoint = newValue?.[String(address)]?.[chainName] as savedEndpoint;

          if (maybeNewEndpoint) {
            setEndpoint({ endpoint: maybeNewEndpoint.endpoint ?? AUTO_MODE.value, timestamp: maybeNewEndpoint.timestamp ?? 0 });
          }
        }
      }
    });
  }, [address, chainName, t]);

  return endpoint;
}
