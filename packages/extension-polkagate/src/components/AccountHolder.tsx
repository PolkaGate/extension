// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import { useInfo, useIsExtensionPopup, useTranslation } from '../hooks';
import { Identity, ShortAddress } from '.';

interface Props {
  address: string | undefined;
  direction?: 'row' | 'column';
  style?: SxProps<Theme> | undefined;
  title?: string;
}

function AccountHolder({ address, direction = 'column', style, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtensionPopup = useIsExtensionPopup();

  const { api, formatted } = useInfo(address);

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' py='5px' sx={style}>
      <Typography fontSize='16px' fontWeight={isExtensionPopup ? 300 : 400} height='18px' textAlign='center'>
        {title ?? t('Account')}
      </Typography>
      <Identity
        address={address}
        api={api}
        direction={direction}
        identiconSize={31}
        showSocial={false}
        style={{
          height: '38px',
          maxWidth: '100%',
          minWidth: '35%',
          width: 'fit-content'
        }}
      />
      <ShortAddress address={formatted} />
    </Grid>
  );
}

export default React.memo(AccountHolder);
