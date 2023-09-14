// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext } from 'react';

import { ActionContext, Header, Loading, MetadataReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { rejectMetaRequest } from '../../messaging';
import Request from './Request';

export default function Metadata(): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(MetadataReqContext);
  const onAction = useContext(ActionContext);

  const onReject = useCallback(
    (): void => {
      rejectMetaRequest(requests[0].id)
        .then(() => onAction())
        .catch(console.error);
    },
    [onAction, requests]
  );

  return (
    <>
      <Header
        onClose={onReject}
        text={t<string>('Metadata')}
      />
      {requests[0]
        ? (
          <Request
            key={requests[0].id}
            metaId={requests[0].id}
            request={requests[0].request}
            url={requests[0].url}
          />
        )
        : <Loading />
      }
    </>
  );
}
