// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Link, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../hooks';

function NeedHelp(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container item justifyContent='center' width='fit-content'>
      <Typography fontSize='15px' pr='5px'>
        {t('Need')}
      </Typography>
      <Link href='https://docs.polkagate.xyz' rel='noreferrer' target='_blank'>
        {t('Help?')}
      </Link>
    </Grid>
  );
}

export default React.memo(NeedHelp);
