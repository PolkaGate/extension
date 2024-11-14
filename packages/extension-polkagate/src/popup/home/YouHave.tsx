// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { YouHaveType } from '../../hooks/useYouHave';

import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Grid, IconButton, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import CountUp from 'react-countup';

import { stars5Black, stars5White } from '../../assets/icons';
import { logoBlack, logoWhite } from '../../assets/logos';
import { FormatPrice } from '../../components';
import HideBalance from '../../components/SVG/HideBalance';
import Currency from '../../fullscreen/homeFullScreen/partials/Currency';
import { changeSign, PORTFOLIO_CHANGE_DECIMAL } from '../../fullscreen/homeFullScreen/partials/TotalBalancePieChart';
import { useCurrency, useIsHideNumbers, useYouHave } from '../../hooks';
import { PRICE_VALIDITY_PERIOD } from '../../hooks/usePrices';
import useTranslation from '../../hooks/useTranslation';
import Menu from '../../partials/Menu';
import { COIN_GECKO_PRICE_CHANGE_DURATION } from '../../util/api/getPrices';
import { countDecimalPlaces, fixFloatingPoint, pgBoxShadow } from '../../util/utils';

export const isPriceOutdated = (youHave: YouHaveType | null | undefined): boolean | undefined =>
  youHave ? (Date.now() - youHave.date > 2 * PRICE_VALIDITY_PERIOD) : undefined;

export default function YouHave (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const youHave = useYouHave();
  const currency = useCurrency();

  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();
  const [isMenuOpen, setOpenMenu] = useState(false);

  const portfolioChange = useMemo(() => {
    if (!youHave?.change) {
      return 0;
    }

    const value = fixFloatingPoint(youHave.change, PORTFOLIO_CHANGE_DECIMAL, false, true);

    return parseFloat(value);
  }, [youHave?.change]);

  const onMenuClick = useCallback(() => {
    setOpenMenu((open) => !open);
  }, []);

  return (
    <Grid alignItems='flex-start' container sx={{ bgcolor: 'background.paper', borderRadius: '10px', minHeight: '130px', mx: '10px', my: '15px', width: '100%', boxShadow: pgBoxShadow(theme) }}>
      <Grid container sx={{ position: 'relative', px: '10px', py: '5px' }}>
        <Grid container item sx={{ textAlign: 'left' }}>
          <Typography sx={{ fontSize: '16px', fontVariant: 'small-caps', mt: '10px' }}>
            {t('My Portfolio')}
          </Typography>
        </Grid>
        <Grid container item justifyContent='flex-start' pt='15px'>
          {isHideNumbers
            ? <Box
              component='img'
              src={(theme.palette.mode === 'dark' ? stars5White : stars5Black) as string}
              sx={{ height: '30px', width: '154px' }}
            />
            : <>
              <Stack alignItems='flex-end' direction='row' justifyContent='space-between' sx={{ textAlign: 'start', width: '100%', pr: '15px' }}>
                <FormatPrice
                  fontSize='28px'
                  fontWeight={500}
                  num={youHave?.portfolio}
                  skeletonHeight={28}
                  textColor={isPriceOutdated(youHave) ? 'primary.light' : 'text.primary'}
                  width='100px'
                  withCountUp
                  withSmallDecimal
                />
                <Typography sx={{ color: !youHave?.change ? 'secondary.contrastText' : youHave.change > 0 ? 'success.main' : 'warning.main', fontSize: '15px', fontWeight: 400 }}>
                  <CountUp
                    decimals={countDecimalPlaces(portfolioChange) || PORTFOLIO_CHANGE_DECIMAL}
                    duration={1}
                    end={portfolioChange}
                    prefix={`${changeSign(youHave?.change)}${currency?.sign}`}
                    suffix={`(${COIN_GECKO_PRICE_CHANGE_DURATION}h)`}
                  />
                </Typography>
              </Stack>
              <Stack alignItems='center' direction='row' spacing={1} sx={{ mt: '5px', textAlign: 'start', width: '100%' }}>
                <FormatPrice
                  fontSize='14px'
                  fontWeight={400}
                  num={youHave?.available}
                  skeletonHeight={14}
                  textColor={'primary.light' }
                  width='100px'
                  withCountUp
                />
                <Typography sx={{ color: 'primary.light', fontSize: '14px', fontWeight: 300 }}>
                  {t('available')}
                </Typography>
              </Stack>
            </>
          }
          <IconButton
            onClick={onMenuClick}
            sx={{ p: 0, position: 'absolute', pt: '3px', right: '3px', top: '11px' }}
          >
            <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ position: 'absolute', right: '55px', top: '8px' }}>
          <HideBalance
            darkColor={theme.palette.secondary.light}
            hide={isHideNumbers}
            lightColor={theme.palette.secondary.light}
            onClick={toggleHideNumbers}
            size={20}
          />
        </Grid>
        <Grid item sx={{ position: 'absolute', right: '25px', top: '10px' }}>
          <Currency
            color='secondary.light'
            fontSize='19px'
            noBorder
          />
        </Grid>
      </Grid>
      <Box
        component='img'
        src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
        sx={{ filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))', height: 52, left: '150px', opacity: '0.1', position: 'absolute', top: '18px', width: 52 }}
      />
      {isMenuOpen &&
        <Menu
          setShowMenu={setOpenMenu}
          theme={theme}
        />
      }
    </Grid>
  );
}
