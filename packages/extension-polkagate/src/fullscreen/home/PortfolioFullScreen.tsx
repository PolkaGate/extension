// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { FormatPrice, MySkeleton } from '../../components';
import { useIsDark, usePortfolio, useTranslation } from '../../hooks';
import DailyChange from '../../popup/home/partial/DailyChange';
import { GlowBox } from '../../style';

const HEIGHT = 48;

function PortfolioFullScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const youHave = usePortfolio();

  return (
    <GlowBox style={{ width: '100%' }}>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '30px 25px 15px' }}>
        <Typography color={isDark ? 'text.secondary' : '#291443'} sx={{ userSelect: 'none' }} variant='B-2'>
          {t('Total Portfolio')}
        </Typography>
        <Grid container item sx={{ height: `${HEIGHT}px`, m: '6px 0 7px' }}>
          {youHave?.portfolio === undefined
            ? (<Stack direction='column' rowGap='8px'>
              <MySkeleton style={{ width: '258px' }} />
              <MySkeleton style={{ width: '155px' }} />
            </Stack>)
            : <FormatPrice
              commify
              decimalColor={theme.palette.text.secondary}
              dotStyle={'big'}
              fontFamily='OdibeeSans'
              fontSize='48px'
              fontWeight={400}
              height={HEIGHT}
              num={youHave.portfolio}
              onHideShape='shape1'
              width='fit-content'
              withCountUp
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
