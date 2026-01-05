// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography } from '@mui/material';
import React, { memo } from 'react';

import { emptyList } from '../../assets/icons/index';
import { Motion } from '../../components';
import { useTranslation } from '../../hooks';

interface Props {
  style?: React.CSSProperties;
  text?: string;
}

function EmptyListBox ({ style = {}, text }: Props) {
  const { t } = useTranslation();

  return (
    <Motion>
      <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ ...style }}>
        <Box
          component='img'
          src={emptyList as string}
          sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
        />
        <Typography color='text.secondary' mb='30px' variant='B-2'>
          {text ?? t('No transaction history is available yet')}
        </Typography>
      </Grid>
    </Motion>
  );
}

export default memo(EmptyListBox);
