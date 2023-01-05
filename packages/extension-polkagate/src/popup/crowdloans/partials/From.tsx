// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows ..
 * */

import type { ApiPromise } from '@polkadot/api';

import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Identity, ShortAddress } from '../../../components';
import { useChain, useTranslation } from '../../../hooks';

interface Props {
  address?: string;
  api: ApiPromise | undefined;
  style?: SxProps<Theme> | undefined;
}

function From({ address, api, style }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const chain = useChain(address);

  return (
    <Grid container item sx={style}>
      <Typography style={{ fontSize: '16px', fontWeight: 300 }}>
        {t('Account holder')}
      </Typography>
      <Grid alignItems='center' container justifyContent='felx-start' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, py: '5px', mt: '2px' }}>
        <Grid item sx={{ fontSize: '28px', fontWeight: 400, maxWidth: '67%' }}>
          <Identity address={address} api={api} chain={chain} formatted={address} identiconSize={31} showSocial={false} />
        </Grid>
        <Grid item sx={{ width: '30%' }}>
          <ShortAddress address={address} style={{ fontSize: '16px', fontWeight: 300, justifyContent: 'flex-start', mt: '5px' }} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(From);
