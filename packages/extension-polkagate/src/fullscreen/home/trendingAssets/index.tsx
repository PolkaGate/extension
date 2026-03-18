// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { AlignBottom } from 'iconsax-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { CurrencyContext, FadeOnScrollHorizontal } from '../../../components';
import { usePrices, useTranslation } from '../../../hooks';
import { VelvetBox } from '../../../style';
import TokenChart from '../../components/LineChart';
import Asset from './Asset';
import Move from './Move';
import { useTrendingAssets } from './useTrendingAssets';

const ASSET_IN_A_ROW = 4;

function TrendingAssets(): React.ReactElement {
  const { t } = useTranslation();
  const pricesInCurrencies = usePrices();
  const { currency } = useContext(CurrencyContext);

  const cardRefs = useRef<HTMLDivElement[]>([]);
  const refContainer = useRef<HTMLDivElement>(null);

  const [cardWidths, setCardWidths] = useState<number[]>([]);
  const [indexMove, setMove] = useState(0);
  const [chartToken, setChartToken] = useState<string>();

  const chartPriceId = useMemo(() => {
    const found = pricesInCurrencies?.prices &&
      Object.entries(pricesInCurrencies?.prices)
        .find(([, info]) => chartToken && info.symbol === chartToken);

    return found?.[0];
  }, [chartToken, pricesInCurrencies?.prices]);

  const trendingAssets = useTrendingAssets(pricesInCurrencies?.prices);

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
