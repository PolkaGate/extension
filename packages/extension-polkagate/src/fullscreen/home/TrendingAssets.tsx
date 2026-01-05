// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PriceValue } from '@polkadot/extension-polkagate/src/util/types';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Grid, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { AlignBottom } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import DailyChange from '@polkadot/extension-polkagate/src/popup/home/partial/DailyChange';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';

import { AssetLogo, CurrencyContext, FadeOnScrollHorizontal } from '../../components';
import { usePrices, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import TokenChart from '../components/LineChart';

const ASSET_IN_A_ROW = 4;

type Direction = 'right' | 'left';

function Move ({ direction, max, setMove }: { direction: Direction, max?: number, setMove: React.Dispatch<React.SetStateAction<number>> }): React.ReactElement {
  const [chevronHovered, setChevronHovered] = useState<Direction>();

  const onMouseEnterChevron = useCallback((type: Direction) => {
    setChevronHovered(type);
  }, []);

  const onMouseLeaveChevron = useCallback(() => {
    setChevronHovered(undefined);
  }, []);

  const onClick = useCallback(() => {
    setMove((pre) => {
      if (!max) {
        return pre;
      }

      if (direction === 'right') {
        return pre + 1 > max ? pre : pre + 1;
      }

      return pre - 1 < 0 ? pre : pre - 1;
    }
    );
  }, [direction, max, setMove]);

  const Component = direction === 'right' ? ChevronRight : ChevronLeft;

  return (
    <Grid alignItems='center' container item justifyContent='center' onClick={onClick} onMouseEnter={() => onMouseEnterChevron(direction)} onMouseLeave={onMouseLeaveChevron} sx={{ bgcolor: chevronHovered === direction ? '#674394' : '#05091C', borderRadius: '8px', border: '3px solid #1B133C', cursor: 'pointer', height: '29px', transition: 'all 0.2s ease-in-out', width: '29px' }}>
      <Component sx={{ color: chevronHovered === direction ? '#EAEBF1' : '#AA83DC', fontSize: '18px' }} />
    </Grid>
  );
}

const Asset = React.forwardRef<HTMLDivElement, { asset: PriceValue, onClick: React.Dispatch<React.SetStateAction<string | undefined>> }>(({ asset, onClick }, ref) => {
  const { currency } = useContext(CurrencyContext);

  const [hoveredIndex, setHoveredIndex] = useState<boolean>(false);

  const _onClick = useCallback(() => {
    onClick(asset.symbol);
  }, [asset.symbol, onClick]);

  const onMouseEnter = useCallback(() => {
    setHoveredIndex(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredIndex(false);
  }, []);

  const logoInfo = getLogo2(asset.genesisHash, asset.symbol);

  return (
    <Stack
      direction='column'
      onClick={_onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={ref}
      sx={{
        bgcolor: hoveredIndex ? '#2D1E4A' : '#05091C',
        borderRadius: '14px',
        cursor: 'pointer',
        minWidth: '122px',
        mr: '5px',
        p: '15px',
        transform: hoveredIndex ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        width: 'fit-content'
      }}
    >
      <AssetLogo assetSize='36px' baseTokenSize='14px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} style={{ width: 'fit-content' }} token={asset?.symbol} />
      <Typography color='#EAEBF1' sx={{ mt: '10px', textAlign: 'left', textWrap: 'nowrap' }} variant='B-2'>
        {asset.symbol} / {currency?.code}
      </Typography>
      <Stack direction='row'>
        <Typography color='#EAEBF1' sx={{ textAlign: 'left' }} variant='B-2'>
          {currency?.sign}{asset.value.toFixed(2)}
        </Typography>
        <DailyChange
          change={asset.change}
          iconSize={12}
          showHours={false}
          showPercentage
          style={{ marginLeft: '5px', minWidth: '57px', padding: '0px 2px' }}
          textVariant='B-4'
        />
      </Stack>
    </Stack>

  );
});

Asset.displayName = 'Asset';

function TrendingAssets (): React.ReactElement {
  const { t } = useTranslation();
  const pricesInCurrencies = usePrices();
  const { currency } = useContext(CurrencyContext);

  const cardRefs = useRef<HTMLDivElement[]>([]);
  const refContainer = useRef<HTMLDivElement>(null);

  const [cardWidths, setCardWidths] = useState<number[]>([]);
  const [indexMove, setMove] = useState(0);
  const [chartToken, setChartToken] = useState<string>();

  const chartPriceId = useMemo(() => {
    const found = pricesInCurrencies?.prices && Object.entries(pricesInCurrencies?.prices).find(([, info]) => chartToken && info.symbol === chartToken);

    return found?.[0];
  }, [chartToken, pricesInCurrencies?.prices]);

  const trendingAssets = useMemo(() => {
    const prices = pricesInCurrencies?.prices;

    if (!prices) {
      return undefined;
    }

    return Object.values(prices).sort((a, b) => b.change - a.change);
  }, [pricesInCurrencies?.prices]);

  useEffect(() => {
    const widths = cardRefs.current.map((ref) => ref?.offsetWidth || 0);

    setCardWidths(widths);
  }, [trendingAssets]);

  const MAX_ASSETS_TO_MOVE = (trendingAssets?.length ?? ASSET_IN_A_ROW) - ASSET_IN_A_ROW;
  const offsetX = -cardWidths.slice(0, indexMove).reduce((sum, w) => sum + w + 5, 0); // include margin

  return (
    <VelvetBox style={{ margin: '0 8px', minHeight: '150px', overflow: 'hidden' }}>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '45px', mb: '4px', px: '10px', width: '100%' }}>
        <Stack alignItems='center' columnGap='5px' direction='row' sx={{ bgcolor: '#97949B26', borderRadius: '9px', height: '24px', px: '5px' }}>
          <AlignBottom color='#97949B' size='18' variant='Bulk' />
          <Typography color='#97949B' variant='B-2'>
            {t('Trending assets')}
          </Typography>
        </Stack>
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Move direction='left' max={MAX_ASSETS_TO_MOVE} setMove={setMove} />
          <Move direction='right' max={MAX_ASSETS_TO_MOVE} setMove={setMove} />
        </Stack>
      </Stack>
      <Stack alignItems='center' direction='row' ref={refContainer} sx={{ overflowX: 'auto', width: 'auto' }}>
        <motion.div
          animate={{ x: offsetX }}
          style={{ display: 'flex' }}
          transition={{ damping: 30, stiffness: 300, type: 'spring' }}
        >
          {
            trendingAssets?.map((asset, index) => {
              return (
                <Asset
                  asset={asset}
                  key={index}
                  onClick={setChartToken}
                  // eslint-disable-next-line react/jsx-no-bind
                  ref={(el) => {
                    if (el) {
                      cardRefs.current[index] = el;
                    }
                  }}
                />
              );
            })}
        </motion.div>
        <FadeOnScrollHorizontal containerRef={refContainer} style={{ height: refContainer.current?.offsetHeight }} width='130px' />
      </Stack>
      {chartPriceId && currency?.code &&
        <TokenChart
          coinId={chartPriceId}
          onClose={setChartToken}
          // vsCurrency={currency.code} no clue why does not work
        />
      }
    </VelvetBox>
  );
}

export default React.memo(TrendingAssets);
