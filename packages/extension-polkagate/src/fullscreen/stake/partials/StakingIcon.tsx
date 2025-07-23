// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React from 'react';

import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useTranslation } from '../../../hooks';

interface Props {
  type: 'solo' | 'pool';
  text?: string;
}

export default function StakingIcon ({ text, type }: Props) {
  const { t } = useTranslation();

  return (
    <Grid alignItems='flex-start' container item sx={{ columnGap: '6px', pl: '18px' }}>
      {type === 'solo'
        ? <SnowFlake size='36' />
        : <Ice asPortfolio size='36' />
      }
      <Typography color='text.primary' textTransform='uppercase' variant='H-2'>
        {
          text ??
          (type === 'solo'
            ? t('Solo Staking')
            : t('Pool Staking'))}
      </Typography>
    </Grid>
  );
}
