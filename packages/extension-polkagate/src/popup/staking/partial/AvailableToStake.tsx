// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { type BN } from '@polkadot/util';

import { DisplayBalance } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useTranslation } from '../../../hooks';

export interface Props {
  stakeType: 'solo' | 'pool';
  availableAmount: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
  style?: SxProps<Theme>;
}

export default function AvailableToStake({ availableAmount, decimal, stakeType, style, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Container
      disableGutters
      sx={{
        alignItems: 'center',
        bgcolor: isDark ? '#2D1E4A4D' : '#FFFFFF',
        border: isDark ? 'none' : '1px solid #E3E8F7',
        borderRadius: '16px',
        boxShadow: isDark ? 'none' : '0 12px 24px rgba(133, 140, 176, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        p: isDark ? '10px' : '5px 16px',
        width: '100%',
        ...style
      }}
    >
      <Grid alignItems='center' container item sx={{ columnGap: '8px', flexWrap: 'nowrap', width: 'fit-content' }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: isDark
              ? stakeType === 'solo' ? '#3D476A' : '#596AFF'
              : '#EAF2FF',
            borderRadius: '50%',
            display: 'flex',
            height: isDark ? 36 : 42,
            justifyContent: 'center',
            minWidth: isDark ? 36 : 42,
            width: isDark ? 36 : 42
          }}
        >
          {stakeType === 'solo'
            ? <SnowFlake color={isDark ? theme.palette.text.highlight : '#3988FF'} size={isDark ? '20' : '22'} />
            : <Ice size='24' style={{ justifyContent: 'center' }} />
          }
        </Box>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column' }}>
          <DisplayBalance
            balance={availableAmount}
            decimal={decimal}
            skeletonStyle={{ margin: '4px 0', width: '100px' }}
            style={{
              color: isDark ? '#ffffff' : theme.palette.text.primary,
              fontFamily: 'Inter',
              fontSize: isDark ? '14px' : '15px',
              fontWeight: 600,
              width: 'max-content'
            }}
            token={token}
          />
          <Typography color={isDark ? 'text.highlight' : 'text.secondary'} variant='B-4' width='fit-content'>
            {t('Available to Stake')}
          </Typography>
        </Container>
      </Grid>
    </Container>
  );
}
