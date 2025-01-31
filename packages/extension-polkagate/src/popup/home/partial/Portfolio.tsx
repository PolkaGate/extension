// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid, styled, type SxProps, type Theme, Typography } from '@mui/material';
import { Eye, EyeSlash } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { CurrencyDisplay } from '../../../components';
import { useAccountAssets, useIsHideNumbers, usePrices, useSelectedAccount, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import { GradientBorder, GradientDivider } from '../../../style';
import AccountVisibilityToggler from './AccountVisibilityToggler';
import Currency from './Currency';
import DailyChange from './DailyChange';

const PortfolioContainerStyle: SxProps<Theme> = {
  border: '2px solid transparent',
  borderRadius: '24px',
  height: '132px',
  overflow: 'hidden',
  position: 'relative',
  width: '359px'
};

const GlowBall = styled('div')({
  backgroundColor: '#FF59EE',
  borderRadius: '50%',
  filter: 'blur(60px)', // Glow effect
  height: '128px',
  left: '35%',
  position: 'absolute',
  top: '-75px',
  width: '100px'
});

const FadeOut = styled('div')({
  background: 'linear-gradient(180deg, transparent 13.79%, #05091C 100%)',
  height: '160px',
  inset: 0,
  position: 'absolute',
  width: '375px'
});

const Fade = styled('div')({
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  height: '220px',
  inset: 0,
  position: 'absolute',
  width: '375px'
});

function Portfolio (): React.ReactElement {
  const { t } = useTranslation();
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
    <Container disableGutters sx={PortfolioContainerStyle}>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '15px 20px', position: 'relative', zIndex: 1 }}>
        <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
          <Typography color='text.secondary' fontFamily='Inter' fontSize='14px' fontWeight={600}>
            {t('Account Portfolio')}
          </Typography>
          {isHideNumbers
            ? <EyeSlash color='#BEAAD8' onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />
            : <Eye color='#BEAAD8' onClick={toggleHideNumbers} size='20' style={{ cursor: 'pointer' }} variant='Bulk' />}
        </Grid>
        <Currency />
        <Grid container item>
          <CurrencyDisplay
            amount={totalWorth}
            decimal={12}
            decimalPartCount={3}
            displayStyle='portfolio'
          />
        </Grid>
        <DailyChange />
        <AccountVisibilityToggler />
      </Grid>
      {/* Styles */}
      <GradientBorder />
      <GradientDivider orientation='vertical' style={{ bottom: 0, height: '65%', left: 0, m: 'auto', position: 'absolute', top: 0, width: '2px' }} />
      <GradientDivider orientation='vertical' style={{ bottom: 0, height: '65%', m: 'auto', position: 'absolute', right: 0, top: 0, width: '2px' }} />
      <GlowBall />
      <Fade />
      <FadeOut />
    </Container>
  );
}

export default Portfolio;
