// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Motion } from '../components';
import { useFavIcon, useTranslation } from '../hooks';
import { extractBaseUrl } from '../util';
import ConnectedAccounts from './ConnectedAccounts';
import DappInfo from './DappInfo';

interface Props {
  access: AuthUrlInfo;
  setAccessToEdit: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditDappAccess ({ access, setAccessToEdit, setRefresh }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { origin, url } = access;

  const favIconUrl = useFavIcon(url);

  const closePopup = useCallback(() => {
    setAccessToEdit(undefined);
  }, [setAccessToEdit]);

  return (
    <Motion variant='zoom'>
      <Grid container item justifyContent='center' sx={{ overflow: 'hidden', position: 'relative', pt: '5px', zIndex: 1 }}>
        <Typography color='text.secondary' variant='B-4'>
          {t('Control which of your accounts this website can access.')}
        </Typography>
        <DappInfo
          dappName={extractBaseUrl(url) ?? origin}
          favicon={favIconUrl}
        />
        <ConnectedAccounts
          closePopup={closePopup}
          dappInfo={access}
          hasBanner={false}
          requestId={undefined}
          setRefresh={setRefresh}
          style={{ px: '15px' }}
        />
      </Grid>
    </Motion>
  );
}
