// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import { useAccount, useChainName, useEndpoint2, useEndpoints, useTranslation } from '../hooks';
import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import { Select } from '.';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export default function RemoteNodeSelector({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chainName = useChainName(address);
  const account = useAccount(address);
  const endpointOptions = useEndpoints(genesisHash || account?.genesisHash);
  const endpoint = useEndpoint2(address);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    // eslint-disable-next-line no-void
    chainName && address && void updateMeta(address, prepareMetaData(chainName, 'endpoint', newEndpoint));
  }, [address, chainName]);

  return (
    <>
      {endpoint &&
        <Select
          _mt='10px'
          label={t<string>('Remote node')}
          onChange={_onChangeEndpoint}
          options={endpointOptions}
          value={endpoint}
        />}
    </>
  );
}
