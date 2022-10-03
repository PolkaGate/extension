// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React from 'react';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';

interface Props {
  className?: string;
}

export default function YouHave({ className }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid
      countainer
      textAlign='center'
      pt='20px'
    >
      <Grid
        item
        xs={12}
      >
        <Typography
          sx={{ fontSize: '18px', fontWeight: 300 }}
        >
          {t('You have')}
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
      >
        <Typography
          sx={{ fontSize: '32px', fontWeight: 500, lineHeight: 1 }}
        >
          {'$1,234.56'}
        </Typography>
      </Grid>
    </Grid>
  );
}
