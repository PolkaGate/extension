// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { YouHaveType } from '../../hooks/useYouHave';

import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Grid, IconButton, Stack, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import CountUp from 'react-countup';

import { stars6Black, stars6White } from '../../assets/icons';
import { FormatPrice, VaadinIcon } from '../../components';
import HideBalance from '../../components/SVG/HideBalance';
import { changeSign, PORTFOLIO_CHANGE_DECIMAL } from '../../fullscreen/homeFullScreen/partials/TotalBalancePieChart';
import { useCurrency, useIsHideNumbers, useYouHave } from '../../hooks';
import { PRICE_VALIDITY_PERIOD } from '../../hooks/usePrices';
import useTranslation from '../../hooks/useTranslation';
import { COIN_GECKO_PRICE_CHANGE_DURATION } from '../../util/api/getPrices';
import { countDecimalPlaces, fixFloatingPoint } from '../../util/utils';

export const isPriceOutdated = (youHave: YouHaveType | null | undefined): boolean | undefined =>
  youHave ? (Date.now() - youHave.date > 2 * PRICE_VALIDITY_PERIOD) : undefined;

export default function YouHave (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const youHave = useYouHave();
  const currency = useCurrency();
  
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  const portfolioChange = useMemo(() => {
    if (!youHave?.change) {
      return 0;
    }

    const value = fixFloatingPoint(youHave.change, PORTFOLIO_CHANGE_DECIMAL, false, true);

    return parseFloat(value);
  }, [youHave?.change]);

  return (
    <Grid container sx={{ p: '5px', position: 'relative' }}>
      <Grid container item sx={{ textAlign: 'left' }}>
        <Typography sx={{ fontSize: '16px', fontVariant: 'small-caps', mt: '10px' }}>
          {t('My Portfolio')}
        </Typography>
        {/* <Grid item sx={{ position: 'absolute', right: 0, top: '50px' }}> */}
        <HideBalance
          hide={isHideNumbers}
          onClick={toggleHideNumbers}
          size={20}
        />
        {/* </Grid> */}
      </Grid>
      <Grid container item justifyContent='flex-start' pt='15px'>
        {isHideNumbers
          ? <Box
            component='img'
            src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string}
            sx={{ height: '36px', width: '154px' }}
          />
          : <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ textAlign: 'start', width: '100%' }}>
            <FormatPrice
              fontSize='30px'
              fontWeight={500}
              height={36}
              num={youHave?.portfolio }
              skeletonHeight={36}
              textColor= { isPriceOutdated(youHave) ? 'primary.light' : 'text.primary'}
              width='223px'
              withCountUp
            />
            <Typography sx={{ color: !youHave?.change ? 'secondary.contrastText' : youHave.change > 0 ? 'success.main' : 'warning.main', fontSize: '16px', fontWeight: 500 }}>
              <CountUp
                decimals={countDecimalPlaces(portfolioChange) || PORTFOLIO_CHANGE_DECIMAL}
                duration={1}
                end={portfolioChange}
                prefix={`${changeSign(youHave?.change)}${currency?.sign}`}
                suffix={`(${COIN_GECKO_PRICE_CHANGE_DURATION}h)`}
              />
            </Typography>
          </Stack>
        }
        {/* <Grid alignItems='center' direction='column' item onClick={onHideClick} sx={{ backgroundColor: 'background.paper', borderRadius: '5px', boxShadow: shadow, cursor: 'pointer', display: 'flex', position: 'absolute', pt: '3px', right: '20px' }}>
          {hideNumbers
            ? <ShowIcon />
            : <HideIcon />
          }
          <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500, userSelect: 'none' }}>
            {hideNumbers ? t('Show') : t('Hide')}
          </Typography>
        </Grid> */}
        <IconButton
          // onClick={menuOnClick}
          sx={{ p: 0, position: 'absolute', pt: '3px', right: '3px', top: '-3px' }}
        >
          <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
        </IconButton>
      </Grid>
      {/* {isMenuOpen &&
        <Menu
          setShowMenu={setOpenMenu}
          theme={theme}
        />
      } */}
    </Grid>
  );
}
