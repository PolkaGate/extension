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

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#2D1E4A4D', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', p: '10px', width: '100%', ...style }}>
      <Grid alignItems='center' container item sx={{ columnGap: '8px', flexWrap: 'nowrap', width: 'fit-content' }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: stakeType === 'solo' ? '#3D476A' : '#596AFF',
            borderRadius: '50%',
            display: 'flex',
            height: 36,
            justifyContent: 'center',
            minWidth: 36,
            width: 36
          }}
        >
          {stakeType === 'solo'
            ? <SnowFlake color={theme.palette.text.highlight} size='20' />
            : <Ice size='24' style={{ justifyContent: 'center' }} />
          }
        </Box>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column' }}>
          <DisplayBalance
            balance={availableAmount}
            decimal={decimal}
            skeletonStyle={{ margin: '4px 0', width: '100px' }}
            style={{
              color: '#ffffff',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              width: 'max-content'
            }}
            token={token}
          />
          <Typography color='text.highlight' variant='B-4' width='fit-content'>
            {t('Available to Stake')}
          </Typography>
        </Container>
      </Grid>
    </Container>
  );
}
