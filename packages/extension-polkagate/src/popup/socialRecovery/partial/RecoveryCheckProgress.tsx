// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React from 'react';

import { useTranslation } from '../../../hooks';

export default function RecoveryCheckProgress() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container direction='column' height='100%' item justifyContent='center'>
      <CubeGrid col={3} color={theme.palette.secondary.main} row={3} size={200} style={{ opacity: '0.4' }} />
      <Typography pt='15px'>
        {t<string>('Checking the account recovery status, please wait...')}
      </Typography>
    </Grid>
  );
}
