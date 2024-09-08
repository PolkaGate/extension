// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, Skeleton } from '@mui/material';
import React, { useMemo } from 'react';

import { useCurrency } from '../hooks';
import { amountToHuman } from '../util/utils';

interface Props {
  amount?: BN | null;
  decimalPoint?: number;
  decimals?: number;
  num?: number | string;
  price?: number | null,
  textAlign?: 'left' | 'right';
  width?: string;
  mt?: string;
  skeletonHeight?: number;
}

export function nFormatter (num: number, decimalPoint: number) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
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

function FormatPrice ({ amount, decimalPoint = 2, decimals, mt = '0px', num, price, skeletonHeight = 15, textAlign = 'left', width = '90px' }: Props): React.ReactElement<Props> {
  const currency = useCurrency();

  const total = useMemo(() => {
    if (num) {
      return num;
    }

    if (amount && decimals && price !== undefined) {
      return parseFloat(amountToHuman(amount, decimals)) * (price || 0);
    }

    return undefined;
  }, [amount, decimals, num, price]);

  return (
    <Grid
      item
      mt={mt}
      textAlign={textAlign}
    >
      {total !== undefined
        ? `${currency?.sign || ''}${nFormatter(total as number, decimalPoint)}`
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
