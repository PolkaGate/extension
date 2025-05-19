// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography } from '@mui/material';
import React, { memo } from 'react';

import { emptyList } from '../../assets/icons/index';
import { useTranslation } from '../../hooks';

function EmptyListBox ({ style = {} }: {style?: React.CSSProperties}) {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx ={{ ...style }}>
      <Box
        component='img'
        src={emptyList as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No transaction history is available yet')}
      </Typography>
    </Grid>
  );
}

export default memo(EmptyListBox);
