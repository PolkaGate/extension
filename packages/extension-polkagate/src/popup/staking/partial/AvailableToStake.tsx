// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { type BN } from '@polkadot/util';

import { FormatBalance2 } from '../../../components';
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

export default function AvailableToStake ({ availableAmount, decimal, stakeType, style, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#2D1E4A4D', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', p: '10px', width: '100%', ...style }}>
      <Grid alignItems='center' container item sx={{ columnGap: '8px', flexWrap: 'nowrap', width: 'fit-content' }}>
        <Grid alignContent='center' container item justifyContent='center' sx={{ bgcolor: stakeType === 'solo' ? '#3D476A' : '#596AFF', borderRadius: 999, height: '36px', minWidth: '36px', width: '36px' }}>
          {stakeType === 'solo'
            ? <SnowFlake color={theme.palette.text.highlight} size='20' />
            : <Ice size='26' />
          }
        </Grid>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column' }}>
          {availableAmount
            ? (
              <FormatBalance2
                decimalPoint={4}
                decimals={[decimal ?? 0]}
                style={{
                  color: '#ffffff',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  width: 'max-content'
                }}
                tokens={[token ?? '']}
                value={availableAmount}
              />)
            : (
              <Skeleton
                animation='wave'
                height='12px'
                sx={{ borderRadius: '50px', fontWeight: 'bold', my: '1px', transform: 'none', width: '125px' }}
                variant='text'
              />
            )
          }
          <Typography color='text.highlight' variant='B-4' width='fit-content'>
            {t('Available to Stake')}
          </Typography>
        </Container>
      </Grid>
    </Container>
  );
}
