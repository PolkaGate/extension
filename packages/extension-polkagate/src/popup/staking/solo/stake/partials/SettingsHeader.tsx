// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../../../hooks';

export default function SettingsHeader(): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <Grid container justifyContent='center' mt='40px'>
      <Typography fontSize='16px' fontWeight={400} sx={{ width: '100%', textAlign: 'center' }}>
        {t<string>('Solo Staking')}
      </Typography>
      <br />
      <Typography fontSize='22px' fontWeight={400} sx={{ width: '100%', textAlign: 'center' }}>
        {t<string>('Advanced settings')}
      </Typography>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
    </Grid>
  );
}
