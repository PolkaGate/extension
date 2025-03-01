// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import CountUp from 'react-countup';

import { useCurrency } from '../hooks';
import { ASSETS_AS_CURRENCY_LIST } from '../util/currencyList';
import { amountToHuman, fixFloatingPoint, getDecimal } from '../util/utils';

interface Props {
  amount?: BN | null;
  decimalPoint?: number;
  decimals?: number;
  commify?: boolean;
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
  withCountUp?: boolean;
  withSmallDecimal?: boolean;
}

export function nFormatter(num: number, decimalPoint: number) {
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
const SMALL_DECIMALS_FONT_SIZE_REDUCTION = 20;

const DecimalPart = ({ value, withCountUp }: { value: string | number, withCountUp: boolean | undefined }) => (
  withCountUp
    ? <CountUp
      duration={1}
      end={Number(getDecimal(value))}
      prefix={'.'}
    />
    : <>{`.${getDecimal(value)}`}</>
);

function FormatPrice({ amount, commify, decimalPoint = 2, decimals, fontSize, fontWeight, height, lineHeight = 1, mt = '0px', num, price, sign, skeletonHeight = 15, textAlign = 'left', textColor, width = '90px', withCountUp, withSmallDecimal }: Props): React.ReactElement<Props> {
  const currency = useCurrency();
  const theme = useTheme();

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
    if (withSmallDecimal) {
      return 0;
    }

    if (currency?.code && ASSETS_AS_CURRENCY_LIST.includes(currency.code)) {
      return DECIMAL_POINTS_FOR_CRYPTO_AS_CURRENCY;
    }

    return decimalPoint;
  }, [currency?.code, decimalPoint, withSmallDecimal]);

  const reduceFontSize = useCallback((fontSize: string | undefined, percentage: number) => {
    if (!fontSize) {
      return undefined;
    }

    const numericValue = parseFloat(fontSize);

    const reducedSize = numericValue * (1 - (percentage / 100));

    return `${Math.round(reducedSize)}px`;
  }, []);

  return (
    <Grid
      item
      mt={mt}
      sx={{ height }}
      textAlign={textAlign}
    >
      {total !== undefined
        ? <Stack
          alignItems='baseline'
          direction='row'
        >
          <Typography
            fontSize={fontSize}
            fontWeight={fontWeight}
            lineHeight={lineHeight}
            sx={{ color: textColor }}
          >
            {withCountUp
              ? <CountUp
                decimals={_decimalPoint}
                duration={1}
                end={parseFloat(String(total))}
                prefix={sign || currency?.sign || ''}
              />
              : <>
                {sign || currency?.sign || ''}{commify ? fixFloatingPoint(total as number, _decimalPoint, true) : nFormatter(total as number, _decimalPoint)}
              </>
            }
          </Typography>
          {withSmallDecimal && Number(total) > 0 &&
            <Typography
              fontSize={reduceFontSize(fontSize, SMALL_DECIMALS_FONT_SIZE_REDUCTION)}
              fontWeight={fontWeight}
              lineHeight={lineHeight}
              sx={{ color: theme.palette.secondary.contrastText }}
            >
              <DecimalPart
                value={total}
                withCountUp={withCountUp}
              />
            </Typography>
          }
        </Stack>
        : <Skeleton
          animation='wave'
          height={skeletonHeight}
          sx={{ fontWeight: 'bold', transform: 'none', width }}
          variant='text'
        />
      }
    </Grid>
  );
}

export default React.memo(FormatPrice);
