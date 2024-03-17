// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { stars6Black, stars6White } from '../../assets/icons';
import { FormatPrice, HideIcon, ShowIcon } from '../../components';
import { usePrices, useYouHave } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { MILLISECONDS_TO_UPDATE } from '../../util/constants';

interface Props {
  hideNumbers: boolean | undefined;
  setHideNumbers: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export default function YouHave ({ hideNumbers, setHideNumbers }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const youHave = useYouHave();

  const pricesInfo = usePrices();
  const isPriceOutdated = useMemo((): boolean | undefined => {
    if (!pricesInfo) {
      return undefined;
    }

    return (Date.now() - pricesInfo.date > MILLISECONDS_TO_UPDATE);
  }, [pricesInfo]);

  const onHideClick = useCallback(() => {
    setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

  return (
    <Grid container pt='15px' textAlign='center' sx={{ position: 'relative', zIndex: 1 }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '18px' }}>
          {t('You have')}
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
            <Typography sx={{ color: isPriceOutdated ? 'primary.light' : 'text.primary', fontSize: '42px', fontWeight: 500, height: 36, lineHeight: 1 }}>
              {youHave === undefined
                ? <Skeleton animation='wave' height={38} sx={{ transform: 'none' }} variant='text' width={223} />
                : <FormatPrice num={youHave || '0'} />
              }
            </Typography>
          </Grid>
        }
        <Grid alignItems='center' direction='column' item onClick={onHideClick} sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', display: 'flex', position: 'absolute', pt: '3px', right: '31px' }}>
          {hideNumbers
            ? <ShowIcon />
            : <HideIcon />
          }
          <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500 }}>
            {hideNumbers ? t('Show') : t('Hide')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
