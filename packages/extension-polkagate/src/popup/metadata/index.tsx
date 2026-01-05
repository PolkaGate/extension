// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';
import { Book } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { ActionContext, Loading, MetadataReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { rejectMetaRequest } from '../../messaging';
import Request from './Request';

export default function Metadata (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const requests = useContext(MetadataReqContext);
  const onAction = useContext(ActionContext);

  const onReject = useCallback(
    (): void => {
      rejectMetaRequest(requests[0].id)
        .then(() => onAction('/'))
        .catch(console.error);
    },
    [onAction, requests]
  );

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 5px' },
        showBackIconAsClose: true
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={onReject}
      open
      popupProps={{
        TitleIcon: Book,
        iconColor: theme.palette.primary.main,
        iconSize: 25,
        maxHeight: '450px',
        withoutTopBorder: true
      }}
      title={t('Update Metadata')}
    >
      <>
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
    </SharePopup>
  );
}
