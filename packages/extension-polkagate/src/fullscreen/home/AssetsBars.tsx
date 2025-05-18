// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetsWithUiAndPrice } from './partials/TotalBalancePieChart';

import { Box, Container, LinearProgress, linearProgressClasses, Stack, styled, type Theme, Typography, useTheme } from '@mui/material';
import React, { useContext, useMemo, useRef } from 'react';

import { calcPrice } from '@polkadot/extension-polkagate/src/hooks/useYouHave';
import { DEFAULT_COLOR, TEST_NETS, TOKENS_WITH_BLACK_LOGO } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { BN, BN_ZERO } from '@polkadot/util';

import { AccountsAssetsContext, AssetLogo, AssetNull, FadeOnScroll, FormatPrice } from '../../components';
import { useCurrency, usePortfolio, usePrices, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';

function adjustColor (token: string, color: string | undefined, theme: Theme): string {
  if (color && (TOKENS_WITH_BLACK_LOGO.find((t) => t === token) && theme.palette.mode === 'dark')) {
    const cleanedColor = color.replace(/^#/, '');

    // Convert hexadecimal to RGB
    const r = parseInt(cleanedColor.substring(0, 2), 16);
    const g = parseInt(cleanedColor.substring(2, 4), 16);
    const b = parseInt(cleanedColor.substring(4, 6), 16);

    // Calculate inverted RGB values
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;

    // Convert back to hexadecimal format
    const invertedHex = `#${(1 << 24 | invertedR << 16 | invertedG << 8 | invertedB).toString(16).slice(1)}`;

    return invertedHex;
  }

  return color || DEFAULT_COLOR;
}

interface BarColorProps {
  barColor?: string;
  barHeight?: number;
}

const BorderLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'barColor'
})<BarColorProps>(({ barColor, barHeight = 12, theme }) => ({
  borderRadius: 5,
  height: barHeight,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#2D1E4A',
    ...theme.applyStyles('dark', {
      backgroundColor: '#2D1E4A'
    })
  },
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: barColor || '#1a90ff',
    borderRadius: 5,
    height: '100%',
    transition: 'transform 0.3s ease-in-out',
    ...theme.applyStyles('dark', {
      backgroundColor: barColor || '#308fe8'
    })
  }
}));

function truncateToMaxYDecimals(num: number, y: number): string {
  const [intPart, decPart] = num.toString().split('.');

  if (!decPart) {
    return intPart;
  }

  return `${intPart}.${decPart.slice(0, y)}`;
}

const WIDTHS = {
  1: 22,
  2: 24,
  3: 27,
  4: 27
};

function PortfolioInRow ({ assets }: { assets: AssetsWithUiAndPrice[] }): React.ReactElement {
  return (
    <Stack direction='row' justifyContent='space-between' sx={{ bgcolor: '#1B133C', borderRadius: '14px', height: '36px', ml: '8px' }}>
      <Stack alignItems='center' direction='row' justifyContent='center' sx={{ bgcolor: '#05091C', borderRadius: '10px', m: '4px', width: '100%' }}>
        <Stack direction='row' sx={{ borderRadius: 12, height: 11, overflow: 'hidden', width: '98%' }}>
          {assets.map((asset, index) => (
            <Box
              key={index}
              sx={{
                bgcolor: asset.ui.color,
                height: '100%',
                width: `${asset.percent}%`
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

function AssetsRows ({ assets }: { assets: AssetsWithUiAndPrice[] }): React.ReactElement {
  const { t } = useTranslation();
  const currency = useCurrency();
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <Container disableGutters>
      <Stack direction='row' justifyContent='space-between' sx={{ m: '8px 12px 5px' }}>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1' width={`${WIDTHS[1]}%`}>
          {t('Token')}
        </Typography>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1' width={`${WIDTHS[2]}%`}>
          {t('Cost')}
        </Typography>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1' width={`${WIDTHS[3]}%`}>
          {t('Allocation')}
        </Typography>
        <Typography color='#BEAAD8' textAlign='right' variant='B-1' width={`${WIDTHS[4]}%`}>
          {t('Value')}
        </Typography>
      </Stack>
      <Container disableGutters ref={refContainer} sx={{ maxHeight: '272px', overflowY: 'scroll' }}>
        {assets.map(({ genesisHash, percent, price, token, totalBalance, ui }, index) => {
          const logoInfo = getLogo2(genesisHash, token);
          const normalizePercent = (p: number) => (p > 5 ? p : p > 0 ? 5 : 0);

          return (
            <Stack alignItems='center' direction='row' key={index} sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '47px', my: '5px', px: '10px' }}>
              <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' width={`${WIDTHS[1]}%`}>
                <AssetLogo assetSize='18px' baseTokenSize='10px' genesisHash={genesisHash} logo={logoInfo?.logo} />
                <Typography variant='B-2'>
                  {token}
                </Typography>
              </Stack>
              <Typography color='#BEAAD8' textAlign='left' variant='B-2' width={`${WIDTHS[2]}%`}>
                {currency?.sign} {price ? truncateToMaxYDecimals(price, 4) : 0}
              </Typography>
              <Stack alignItems='center' direction='row' justifyContent='start' width={`${WIDTHS[3]}%`}>
                <Typography color='#BEAAD8' minWidth='60px' sx={{ textAlign: 'left', textWrap: 'nowrap' }} variant='B-2'>
                  {percent >= 0.01 ? truncateToMaxYDecimals(percent, 2) : '~ 0'}%
                </Typography>
                <BorderLinearProgress barColor={ui.color} barHeight={8} sx={{ width: '72px' }} value={normalizePercent(percent)} variant='determinate' />
              </Stack>
              <FormatPrice
                commify
                decimalColor='#BEAAD8'
                fontFamily='Inter'
                fontSize='14px'
                fontWeight={600}
                num={totalBalance}
                style={{ display: 'flex', justifyContent: 'end', width: `${WIDTHS[4]}%` }}
                textAlign='right'
              />
            </Stack>
          );
        })
        }
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} style={{ borderRadius: '14px', justifySelf: 'center', width: '100%' }} />
      </Container>
    </Container>
  );
}

function AssetsBars (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const pricesInCurrencies = usePrices();
  const youHave = usePortfolio();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const assets = useMemo((): AssetsWithUiAndPrice[] | undefined => {
    if (!accountsAssets || !youHave || !pricesInCurrencies) {
      return undefined;
    }

    let allAccountsAssets = [] as AssetsWithUiAndPrice[];
    const balances = accountsAssets.balances;

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        if (!TEST_NETS.includes(genesisHash)) {
          allAccountsAssets = allAccountsAssets.concat(balances[address][genesisHash] as unknown as AssetsWithUiAndPrice[]);
        }
      });
    });

    const groupedAssets = allAccountsAssets.reduce((acc, asset) => {
      const key = asset.priceId; // Group by priceId

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(asset);

      return acc;
    }, {} as Record<string, AssetsWithUiAndPrice[]>);

    const aggregatedAssets = Object.keys(groupedAssets).map((index) => {
      const assetSample = groupedAssets[index][0];
      const ui = getLogo2(assetSample?.genesisHash, assetSample?.token);
      const assetPrice = pricesInCurrencies.prices[assetSample.priceId]?.value;

      const accumulatedBalancePerPriceId = groupedAssets[index].reduce((sum, { totalBalance }) => sum.add(new BN(totalBalance)), BN_ZERO);

      const balancePrice = calcPrice(assetPrice, accumulatedBalancePerPriceId, assetSample.decimal ?? 0);

      const percent = (balancePrice / youHave.portfolio) * 100;

      return ({
        ...assetSample,
        percent,
        price: assetPrice,
        totalBalance: balancePrice,
        ui: {
          color: adjustColor(assetSample.token, ui?.color, theme),
          logo: ui?.logo
        }
      });
    });

    aggregatedAssets.sort((a, b) => b.percent - a.percent);

    return aggregatedAssets;
  }, [accountsAssets, youHave, pricesInCurrencies, theme]);

  return (
    <Container disableGutters>
      {
        !!assets?.length && !!youHave?.portfolio &&
        <PortfolioInRow
          assets={assets}
        />
      }
      <VelvetBox style={{ margin: '8px', minHeight: '200px' }}>
        {
          !assets?.length || !youHave?.portfolio
            ? <AssetNull
              text={t("You don't have any valuable tokens yet")}
            />
            : <AssetsRows
              assets={assets}
            />
        }
      </VelvetBox>
    </Container>
  );
}

export default React.memo(AssetsBars);
