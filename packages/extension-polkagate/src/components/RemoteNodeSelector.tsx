// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import EndpointManager from '../class/endpointManager';
import { useEndpoints, useInfo, useTranslation } from '../hooks';
import { AUTO_MODE } from '../util/constants';
import { Select } from '.';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

const endpointManager = new EndpointManager();

export default function RemoteNodeSelector({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { account, endpoint } = useInfo(address);
  const endpointOptions = useEndpoints(genesisHash || account?.genesisHash);

  const onChangeEndpoint = useCallback((newEndpoint?: string | number): void => {
    if (!newEndpoint || typeof (newEndpoint) === 'number' || !genesisHash || !address) {
      return;
    }

    const addressKey = String(address);
    const checkForNewOne = newEndpoint === AUTO_MODE.value && endpointManager.get(addressKey, genesisHash)?.isAuto;

    endpointManager.set(addressKey, genesisHash, {
      checkForNewOne,
      endpoint: newEndpoint,
      isAuto: newEndpoint === AUTO_MODE.value,
      timestamp: Date.now()
    });
  }, [address, genesisHash]);

  return (
    <>
      {endpoint &&
        <Select
          _mt='3px'
          defaultValue={undefined}
          label={t('Remote node')}
          onChange={onChangeEndpoint}
          options={endpointOptions}
          value={endpoint}
        />}
    </>
  );
}
