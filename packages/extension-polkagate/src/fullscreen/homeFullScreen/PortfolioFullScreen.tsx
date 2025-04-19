// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React from 'react';

import { FormatPrice } from '../../components';
import { useIsDark, useTranslation } from '../../hooks';
import useYouHave from '../../hooks/useYouHave';
import DailyChange from '../../popup/home/partial/DailyChange';
import { GlowBox } from '../../style';

const HEIGHT = 48;

function PortfolioFullScreen (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const youHave = useYouHave();

  return (
    <GlowBox style={{ width: '100%' }} withFading={false}>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '30px 25px 15px' }}>
        <Typography color={isDark ? 'text.secondary' : '#291443'} sx={{ userSelect: 'none' }} variant='B-2'>
          {t('Total Portfolio')}
        </Typography>
        <Grid container item sx={{ height: `${HEIGHT}px`, my: '8px' }}>
          {youHave?.portfolio === undefined
            ? <Skeleton
              animation='wave'
              height='24px'
              sx={{ borderRadius: '50px', fontWeight: 'bold', maxWidth: '245px', transform: 'none', width: '100%' }}
              variant='text'
            />
            : <FormatPrice
              commify
              decimalColor={theme.palette.text.secondary}
              dotStyle={'big'}
              fontFamily='OdibeeSans'
              fontSize='48px'
              fontWeight={400}
              height={HEIGHT}
              num={youHave.portfolio}
              width='fit-content'
              withSmallDecimal
            />
          }
        </Grid>
        <DailyChange />
      </Grid>
    </GlowBox>
  );
}

export default PortfolioFullScreen;
