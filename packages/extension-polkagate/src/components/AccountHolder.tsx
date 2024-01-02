// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { useApi, useFormatted, useTranslation } from '../hooks';
import { Identity, ShortAddress } from '.';

interface Props {
  address: string;
  style?: SxProps<Theme> | undefined;
  title?: string;
}

function AccountHolder ({ address, style, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const api = useApi(address);

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' py='5px' sx={style}>
      <Typography fontSize='16px' fontWeight={300} height='18px' textAlign='center'>
        {title ?? t<string>('Account holder')}
      </Typography>
      <Identity
        address={address}
        api={api}
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
