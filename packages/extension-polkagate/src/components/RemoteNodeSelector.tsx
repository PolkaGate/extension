// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChromeStorageGetResponse } from '../util/types';

import React, { useCallback } from 'react';

import { useEndpoints, useInfo, useTranslation } from '../hooks';
import { AUTO_MODE } from '../util/constants';
import { Select } from '.';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function RemoteNodeSelector ({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { account, endpoint } = useInfo(address);
  const endpointOptions = useEndpoints(genesisHash || account?.genesisHash);

  const onChangeEndpoint = useCallback((newEndpoint?: string | number): void => {
    if (!newEndpoint || typeof (newEndpoint) === 'number' || !genesisHash || !address) {
      return;
    }

    genesisHash && address && chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
      const addressKey = String(address);
      const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

      savedEndpoints[addressKey] = savedEndpoints[addressKey] || {};
      const checkForNewOne = newEndpoint === AUTO_MODE.value && !savedEndpoints[addressKey][genesisHash]?.isOnManuel;

      savedEndpoints[addressKey][genesisHash] = {
        checkForNewOne,
        endpoint: newEndpoint,
        isOnManuel: newEndpoint !== AUTO_MODE.value,
        timestamp: Date.now()
      };

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ endpoints: savedEndpoints });
    });
  }, [address, genesisHash]);

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
