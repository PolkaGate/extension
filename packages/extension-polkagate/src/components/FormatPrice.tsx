// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, Skeleton, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { useCurrency } from '../hooks';
import { ASSETS_AS_CURRENCY_LIST } from '../util/currencyList';
import { amountToHuman } from '../util/utils';

interface Props {
  amount?: BN | null;
  decimalPoint?: number;
  decimals?: number;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: number;
  mt?: string;
  num?: number | string;
  price?: number | null,
  sign?: string;
  skeletonHeight?: number;
  textAlign?: 'left' | 'right';
  textColor?: string;
  height?: number;
  width?: string;
}

export function nFormatter (num: number, decimalPoint: number) {
  const lookup = [
    { symbol: '', value: 1 },
    { symbol: 'k', value: 1e3 },
    { symbol: 'M', value: 1e6 },
    { symbol: 'G', value: 1e9 },
    { symbol: 'T', value: 1e12 },
    { symbol: 'P', value: 1e15 },
    { symbol: 'E', value: 1e18 }
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });

  if (!item && num > 0) {
    return num.toFixed(decimalPoint).replace(rx, '$1');
  }

  return item ? (num / item.value).toFixed(decimalPoint).replace(rx, '$1') + item.symbol : '0';
}

const DECIMAL_POINTS_FOR_CRYPTO_AS_CURRENCY = 4;

function FormatPrice ({ amount, decimalPoint = 2, decimals, fontSize, fontWeight, height, lineHeight = 1, mt = '0px', num, price, sign, skeletonHeight = 15, textAlign = 'left', textColor, width = '90px' }: Props): React.ReactElement<Props> {
  const currency = useCurrency();

  const total = useMemo(() => {
    if (num !== undefined) {
      return num;
    }

    if (amount && decimals && price !== undefined) {
      return parseFloat(amountToHuman(amount, decimals)) * (price || 0);
    }

    return undefined;
  }, [amount, decimals, num, price]);

  const _decimalPoint = useMemo(() => {
    if (currency?.code && ASSETS_AS_CURRENCY_LIST.includes(currency.code)) {
      return DECIMAL_POINTS_FOR_CRYPTO_AS_CURRENCY;
    }

    return decimalPoint;
  }, [currency?.code, decimalPoint]);

  return (
    <Grid
      item
      mt={mt}
      sx={{ height }}
      textAlign={textAlign}
    >
      {total !== undefined
        ? <Typography
          fontSize={fontSize}
          fontWeight={fontWeight}
          lineHeight={lineHeight}
          sx={{ color: textColor }}
        >
          {sign || currency?.sign || ''}{nFormatter(total as number, _decimalPoint)}
        </Typography>
        : <Skeleton
          animation='wave'
          height={skeletonHeight}
          sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width }}
        />
      }
    </Grid>
  );
}

export default React.memo(FormatPrice);
