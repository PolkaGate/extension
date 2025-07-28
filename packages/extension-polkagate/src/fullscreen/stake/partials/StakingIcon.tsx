// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { People, UserOctagon } from 'iconsax-react';
import React from 'react';

import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useTranslation } from '../../../hooks';

interface Props {
  type: 'solo' | 'pool';
  text?: string;
  variant?: 'nature' | 'people';
  style?: SxProps<Theme>;
  noText?: boolean;
}

export default function StakingIcon ({ noText = false, style, text, type, variant = 'nature' }: Props) {
  const { t } = useTranslation();

  return (
    <Grid alignItems={variant === 'people' ? 'center' : 'flex-start'} container item sx={{ columnGap: '6px', pl: '18px', ...style }}>
      {
        variant === 'people'
          ? <>
            {
              type === 'solo'
                ? <UserOctagon color='#AA83DC' size='36' variant='Bulk' />
                : <People color='#AA83DC' size='32' variant='Bulk' />
            }
          </>
          : <>
            {
              type === 'solo'
                ? <SnowFlake size='36' />
                : <Ice asPortfolio size='36' />
            }
          </>
      }
      {!noText &&
        <Typography color='text.primary' textTransform='uppercase' variant='H-2'>
          {
            text ??
            (type === 'solo'
              ? t('Solo Staking')
              : t('Pool Staking'))}
        </Typography>}
    </Grid>
  );
}
