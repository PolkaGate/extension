// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React, { } from 'react';

import { FormatPrice } from '../../../components';
import { useIsDark, usePrices } from '../../../hooks';
import DailyChange from './DailyChange';

export function TokenPriceInfo({ priceId, token }: { priceId?: string, token?: string }) {
  const pricesInCurrency = usePrices();
  const isDark = useIsDark();

  return (
    <Grid container direction='column' item sx={{ width: 'fit-content' }}>
      <Typography color='text.primary' textAlign='left' variant='B-2'>
        {token}
      </Typography>
      <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '10px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          ignoreHide
          num={pricesInCurrency?.prices[priceId ?? '']?.value ?? 0}
          skeletonHeight={14}
          textColor={isDark ? '#AA83DC' : '#8299BD'}
          width='fit-content'
        />
        {priceId && pricesInCurrency?.prices[priceId]?.change &&
          <DailyChange
            change={pricesInCurrency.prices[priceId].change}
            iconSize={12}
            showHours={false}
            showPercentage
            textVariant='B-4'
          />
        }
      </Grid>
    </Grid>
  );
}
