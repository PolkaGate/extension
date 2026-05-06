// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { MySkeleton } from '../../components';

const ChartHeader = () => {
  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'space-between', m: 'auto', width: '98%' }}>
      <MySkeleton
        bgcolor='#BEAAD840'
        height={43.5}
        style={{ borderRadius: '11px' }}
        width={190}
      />
      <MySkeleton
        bgcolor='#BEAAD840'
        height={43.5}
        style={{ borderRadius: '11px' }}
        width={71.27}
      />
    </Container>
  );
};

interface RewardsLoadingProps {
  type: 'solo' | 'pool';
  isDark?: boolean;
}

const RewardTable = ({ type }: RewardsLoadingProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ gap: '10px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: '8px', px: '12px', width: '100%' }}>
        <Typography color='text.secondary' textAlign='left' variant='B-1' width='48%'>
          {t('Date')}
        </Typography>
        <Typography color='text.secondary' textAlign='left' variant='B-1' width='22%'>
          {type === 'pool' ? t('Time') : t('Era')}
        </Typography>
        <Typography color='text.secondary' textAlign='left' variant='B-1' width='30%'>
          {t('Reward')}
        </Typography>
      </Container>
      {
        Array.from({ length: 5 }).map((_, index) => {
          return (
            <MySkeleton
              bgcolor='#946CC840'
              height={48}
              key={index}
              style={{ borderRadius: '11px' }}
              width='100%'
            />
          );
        })
      }
    </Stack>
  );
};

function Chart() {
  return (
    <Stack alignItems='end' columnGap='10px' direction='row' margin='auto'>
      {
        Array.from({ length: 15 }).map((_, index) => {
          const height = Math.random() * 240;

          return (
            <MySkeleton
              height={height}
              key={index}
              width={25}
            />
          );
        })
      }
    </Stack>
  );
}

function RewardsLoading({ isDark, type }: RewardsLoadingProps) {
  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '18px', p: '18px', pr: 0 }}>
      <Stack direction='column' justifyContent='space-between' sx={{ bgcolor: isDark ? '#1B133C' : '#F8FAFF', borderRadius: '18px', width: '533px' }}>
        <ChartHeader />
        <Chart />
      </Stack>
      <Grid container item sx={{ maxHeight: '324px', overflow: 'hidden', overflowY: 'auto', width: '482px' }}>
        <RewardTable type={type} />
      </Grid>
    </Container>
  );
}

export default React.memo(RewardsLoading);
