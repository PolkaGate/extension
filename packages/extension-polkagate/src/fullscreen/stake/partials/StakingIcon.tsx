// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { People, UserOctagon } from 'iconsax-react';
import React, { useMemo } from 'react';

import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';

interface Props {
  type: 'solo' | 'pool';
  text?: string;
  size?: string;
  variant?: 'nature' | 'people';
  style?: SxProps<Theme>;
  noText?: boolean;
}

export default function StakingIcon ({ noText = false, size, style, text, type, variant = 'nature' }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const textColor = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);

  return (
    <Grid alignItems={variant === 'people' ? 'center' : 'flex-start'} container item sx={{ columnGap: '6px', pl: '18px', ...style }}>
      {
        variant === 'people'
          ? <>
            {
              type === 'solo'
                ? <UserOctagon color={textColor} size={size ?? '36'} variant='Bulk' />
                : <People color={textColor} size={size ?? '32'} variant='Bulk' />
            }
          </>
          : <>
            {
              type === 'solo'
                ? <SnowFlake color={textColor} size={size ?? '36'} />
                : <Ice asPortfolio color={textColor} size={size ?? '36'} />
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
