// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChromeStorageGetResponse } from '../util/types';

import React, { useCallback } from 'react';

import { useEndpoints, useInfo, useTranslation } from '../hooks';
import { Select } from '.';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function RemoteNodeSelector ({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { account, chainName, endpoint } = useInfo(address);
  const endpointOptions = useEndpoints(genesisHash || account?.genesisHash);

  const onChangeEndpoint = useCallback((newEndpoint?: string | number): void => {
    if (!newEndpoint || typeof (newEndpoint) === 'number' || !chainName || !address) {
      return;
    }

    chainName && address && chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
      const i = `${address}`;
      const j = `${chainName}`;
      const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

      savedEndpoints[i] = savedEndpoints[i] || {};

      savedEndpoints[i][j] = {
        endpoint: newEndpoint,
        timestamp: Date.now()
      };

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ endpoints: savedEndpoints });
    });
  }, [address, chainName]);

  return (
    <>
      {endpoint &&
        <Select
          _mt='10px'
          defaultValue={undefined}
          label={t('Remote node')}
          onChange={onChangeEndpoint}
          options={endpointOptions}
          value={endpoint}
        />}
    </>
  );
}
