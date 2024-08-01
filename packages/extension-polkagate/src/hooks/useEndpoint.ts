// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { createWsEndpoints } from '@polkagate/apps-config';
import { useEffect, useState } from 'react';

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useChainName, useTranslation } from '.';

export default function useEndpoint(address: AccountId | string | undefined, _endpoint?: string): string | undefined {
  const chainName = useChainName(address);
  const { t } = useTranslation();
  const [endpoint, setEndpoint] = useState<string | undefined>();

  useEffect(() => {
    if (_endpoint) {
      setEndpoint(_endpoint);

      return;
    }

    if (!address || !chainName) {
      setEndpoint(undefined);

      return;
    }

    browser.storage.local.get('endpoints', (res) => {
      const i = `${String(address)}`;
      const j = `${chainName}`;
      const savedEndpoint = res?.endpoints?.[i]?.[j] as string | undefined;

      if (savedEndpoint) {
        setEndpoint(savedEndpoint);
      } else {
        const allEndpoints = createWsEndpoints(t);

        const endpoints = allEndpoints?.filter((e) =>
          e.value &&
          (String(e.info)?.toLowerCase() === chainName?.toLowerCase() ||
            String(e.text)?.toLowerCase()?.includes(chainName?.toLowerCase()))
        );

        if (endpoints?.length) {
          setEndpoint(endpoints[0].value);
        } else {
          // Endpoint not found, handle the error (e.g., set a default value?)
          setEndpoint(undefined);
        }
      }
    });
  }, [_endpoint, address, chainName, t]);

  useEffect(() => {
    address && chainName && browser.storage.onChanged.addListener((changes, namespace) => {
      for (const [key, { newValue, oldValue }] of Object.entries(changes)) {
        if (key === 'endpoints' && namespace === 'local') {
          const maybeNewEndpoint = newValue?.[String(address)]?.[chainName];

          if (maybeNewEndpoint) {
            setEndpoint(maybeNewEndpoint);
          }
        }
      }
    });
  }, [address, chainName, t]);

  return endpoint;
}
