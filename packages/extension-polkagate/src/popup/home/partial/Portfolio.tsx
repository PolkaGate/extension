// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { Eye, EyeSlash } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { FormatPrice } from '../../../components';
import { useAccountAssets, useIsDark, useIsHideNumbers, usePrices, useSelectedAccount, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import { GlowBox } from '../../../style';
import AccountVisibilityToggler from './AccountVisibilityToggler';
import Currency from './Currency';
import DailyChange from './DailyChange';

function Portfolio (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();

  const eyeColor = isDark ? '#BEAAD8' : '#745D8B';

  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const pricesInCurrency = usePrices();
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const totalWorth = useMemo(() => {
    if (!accountAssets?.length) {
      return undefined;
    }

    return accountAssets.reduce((total, asset) => {
      const assetWorth = calcPrice(
        priceOf(asset.priceId),
        asset.totalBalance,
        asset.decimal
      );

      return total + assetWorth;
    }, 0);
  }, [accountAssets, priceOf]);

  return (
    <GlowBox>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '15px 20px 5px' }}>
        <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
          <Typography color= {isDark ? 'text.secondary' : '#291443'} variant='B-2'>
            {t('Account Portfolio')}
          </Typography>
          {isHideNumbers
            ? <EyeSlash color={eyeColor} onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />
            : <Eye color={eyeColor} onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />}
        </Grid>
        <Currency />
        <Grid container item>
          {totalWorth === undefined
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
              fontSize='40px'
              fontWeight={400}
              height={40}
              num={totalWorth}
              width='fit-content'
              withSmallDecimal
            />
          }
        </Grid>
        <DailyChange />
        <AccountVisibilityToggler />
      </Grid>
    </GlowBox>
  );
}

export default Portfolio;
