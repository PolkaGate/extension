// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { YouHaveType } from '../../hooks/useYouHave';

import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import { stars6Black, stars6White } from '../../assets/icons';
import { FormatPrice, HideIcon, ShowIcon } from '../../components';
import { useYouHave } from '../../hooks';
import { PRICE_VALIDITY_PERIOD } from '../../hooks/usePrices';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  hideNumbers: boolean | undefined;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export const isPriceOutdated = (youHave: YouHaveType | null | undefined): boolean | undefined =>
  youHave ? (Date.now() - youHave.date > 2 * PRICE_VALIDITY_PERIOD) : undefined;

export default function YouHave ({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const youHave = useYouHave();

  const shadow = theme.palette.mode === 'dark' ? '0px 0px 3px rgba(50, 50, 50, 1)' : '0px 0px 5px 0px rgba(0, 0, 0, 0.1)';

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

  return (
    <Grid container sx={{ pb: '10px', position: 'relative', pt: '5px', textAlign: 'center', zIndex: 1 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '16px', fontVariant: 'small-caps' }}>
          {t('My Portfolio')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='center' xs={12}>
        {hideNumbers || hideNumbers === undefined
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '36px', width: '154px' }}
          />
          : <Grid item pr='15px'>
            <Typography sx={{ color: isPriceOutdated(youHave) ? 'primary.light' : 'text.primary', fontSize: '42px', fontWeight: 500, height: 36, lineHeight: 1 }}>
              {youHave === undefined
                ? <Skeleton animation='wave' height={38} sx={{ transform: 'none' }} variant='text' width={223} />
                : <FormatPrice num={youHave?.portfolio || '0'} />
              }
            </Typography>
          </Grid>
        }
        <Grid alignItems='center' direction='column' item onClick={onHideClick} sx={{ backgroundColor: 'background.paper', borderRadius: '5px', boxShadow: shadow, cursor: 'pointer', display: 'flex', position: 'absolute', pt: '3px', right: '20px' }}>
          {hideNumbers
            ? <ShowIcon />
            : <HideIcon />
          }
          <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500, userSelect: 'none' }}>
            {hideNumbers ? t('Show') : t('Hide')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
