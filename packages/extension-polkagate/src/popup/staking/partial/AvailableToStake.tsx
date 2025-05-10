// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { type BN } from '@polkadot/util';

import { FormatBalance2 } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useTranslation } from '../../../hooks';
import StakingActionButton from './StakingActionButton';

export interface Props {
  stakeType: 'solo' | 'pool';
  availableAmount: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
  path?: string;
  style?: SxProps<Theme>;
  noStakeButton?: boolean;
}

export default function AvailableToStake ({ availableAmount, decimal, noStakeButton = false, path, stakeType, style, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const onClick = useCallback(() => navigate(path ?? '') as void, [navigate, path]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#2D1E4A4D', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', p: '10px', width: '100%', ...style }}>
      <Grid alignItems='center' container item sx={{ columnGap: '8px', flexWrap: 'nowrap', width: 'fit-content' }}>
        <Grid alignContent='center' container item justifyContent='center' sx={{ bgcolor: stakeType === 'solo' ? '#3D476A' : '#596AFF', borderRadius: 999, height: '36px', minWidth: '36px', width: '36px' }}>
          {stakeType === 'solo'
            ? <SnowFlake color={theme.palette.text.highlight} size='20' />
            : <Ice size='28' />
          }
        </Grid>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                height='18px'
                sx={{ borderRadius: '50px', fontWeight: 'bold', transform: 'none', width: '55px' }}
                variant='text'
              />
            )
          }
          <Typography color='text.highlight' variant='B-4' width='fit-content'>
            {t('Available to Stake')}
          </Typography>
        </Container>
      </Grid>
      {!noStakeButton && path &&
        <StakingActionButton
          disabled={!availableAmount || availableAmount.isZero()}
          onClick={onClick}
          style={{ height: '28px', width: 'fit-content' }}
          text={t('Stake')}
        />}
    </Container>
  );
}
