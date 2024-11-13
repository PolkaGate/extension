// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { YouHaveType } from '../../hooks/useYouHave';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { stars6Black, stars6White } from '../../assets/icons';
import { FormatPrice } from '../../components';
import { setStorage } from '../../components/Loading';
import HideBalance from '../../components/SVG/HideBalance';
import { useIsHideNumbers, useYouHave } from '../../hooks';
import { PRICE_VALIDITY_PERIOD } from '../../hooks/usePrices';
import useTranslation from '../../hooks/useTranslation';

export const isPriceOutdated = (youHave: YouHaveType | null | undefined): boolean | undefined =>
  youHave ? (Date.now() - youHave.date > 2 * PRICE_VALIDITY_PERIOD) : undefined;

export default function YouHave (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const youHave = useYouHave();
  const isHideNumbers = useIsHideNumbers();

  const onHideClick = useCallback(() => {
    setStorage('hide_numbers', !isHideNumbers).catch(console.error);
  }, [isHideNumbers]);

  return (
    <Grid container sx={{ pb: '10px', position: 'relative', pt: '5px', textAlign: 'center', zIndex: 1 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '16px', fontVariant: 'small-caps' }}>
          {t('My Portfolio')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='center' xs={12}>
        {isHideNumbers
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '36px', width: '154px' }}
          />
          : <FormatPrice
            fontSize='32px'
            fontWeight={500}
            height={36}
            num={youHave?.portfolio }
            skeletonHeight={36}
            textColor= { isPriceOutdated(youHave) ? 'primary.light' : 'text.primary'}
            width='223px'
            withCountUp
          />
        }
        <Grid alignItems='center' item sx={{ position: 'absolute', right: '14px', top: '25px' }}>
          <HideBalance
            border={false}
            hide={isHideNumbers}
            lightColor={theme.palette.secondary.light}
            onClick={onHideClick}
            size={22}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
