// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import CountUp from 'react-countup';

import { useCurrency, useIsHideNumbers } from '../hooks';
import { ASSETS_AS_CURRENCY_LIST } from '../util/currencyList';
import { amountToHuman, getDecimal } from '../util/utils';
import Dots, { type DotsStyle } from './Dots';

interface Props {
  amount?: BN | null;
  commify?: boolean;
  decimalColor?: string;
  decimalPoint?: number;
  decimals?: number;
  dotStyle?: DotsStyle;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  height?: number;
  ignoreHide?: boolean; // ignore hide numbers
  lineHeight?: number;
  mt?: string;
  num?: number | string;
  price?: number | null,
  sign?: string;
  style?: React.CSSProperties;
  skeletonHeight?: number;
  textAlign?: 'left' | 'right';
  textColor?: string;
  width?: string;
  withCountUp?: boolean;
  withSmallDecimal?: boolean;
}

const DECIMAL_POINTS_FOR_CRYPTO_AS_CURRENCY = 4;
const SMALL_DECIMALS_FONT_SIZE_REDUCTION = 20;

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

const DecimalPart = ({ value, withCountUp }: { value: string | number, withCountUp: boolean | undefined }) => (
  withCountUp
    ? <CountUp
      duration={1}
      end={Number(getDecimal(value))}
      prefix={'.'}
    />
    : <>{`.${getDecimal(value)}`}</>
);

export function formatDecimalWithCommas (_number: number | string, decimalDigit = 2, commify?: boolean) {
  const sNumber = Number(_number) < 0 ? String(-Number(_number)) : String(_number);
  const dotIndex = sNumber.indexOf('.');

  if (dotIndex < 0) {
    return { decimalPart: '', integerPart: sNumber }; // No decimal part
  }

  let integerDigits = sNumber.slice(0, dotIndex);
  const fractionalDigits = decimalDigit === 0 ? '' : sNumber.slice(dotIndex + 1, dotIndex + decimalDigit + 1);

  if (commify) {
    integerDigits = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas for thousands
  }

  return { decimalPart: fractionalDigits, integerPart: integerDigits };
}

function FormatPrice ({ amount, commify, decimalColor, decimalPoint = 2, decimals, dotStyle, fontFamily, fontSize, fontWeight, height, ignoreHide, lineHeight = 1, mt = '0px', num, price, sign, skeletonHeight = 15, style = {}, textAlign = 'left', textColor, width = '90px', withCountUp, withSmallDecimal }: Props): React.ReactElement<Props> {
  const currency = useCurrency();
  const theme = useTheme();
  const { isHideNumbers } = useIsHideNumbers();

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

  const { decimalPart, integerPart } = formatDecimalWithCommas(total as number, _decimalPoint, commify);

  const mayCurrencySign = sign || currency?.sign || '';
  const formattedTotal = useMemo(() => (
    <>
      {mayCurrencySign}
      <span>
        {integerPart.split(',').map((part, idx, arr) => (
          <>
            <span key={`number-${idx}`} style={{ color: textColor }}>
              {part}
            </span>
            {idx < arr.length - 1 && (
              <span key={`comma-${idx}`} style={{ color: decimalColor || textColor || theme.palette.secondary.contrastText }}>
                ,
              </span>
            )}
          </>
        ))}
        {decimalPart && (
          <span style={{ color: decimalColor || textColor || theme.palette.secondary.contrastText }}>
            {'.'}{decimalPart}
          </span>
        )}
      </span>
    </>
  ), [decimalColor, decimalPart, integerPart, mayCurrencySign, textColor, theme.palette.secondary.contrastText]);

  return (
    <Grid item mt={mt} sx={{ height, ...style }} textAlign={textAlign}>
      {isHideNumbers && !ignoreHide
        ? <Dots
          color={textColor}
          decimalColor={decimalColor}
          preText={mayCurrencySign}
          preTextFontSize={fontSize}
          preTextFontWeight={fontWeight}
          style={dotStyle}
        />
        : total !== undefined
          ? <Stack alignItems='baseline' direction='row' width='fit-content'>
            <Typography
              fontFamily={fontFamily}
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
                  {formattedTotal}
                </>
              }
            </Typography>
            {withSmallDecimal && Number(total) > 0 &&
              <Typography
                fontFamily={fontFamily}
                fontSize={reduceFontSize(fontSize, SMALL_DECIMALS_FONT_SIZE_REDUCTION)}
                fontWeight={fontWeight}
                lineHeight={lineHeight}
                sx={{ color: decimalColor || theme.palette.secondary.contrastText }}
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
            sx={{ borderRadius: '14px', fontWeight: 'bold', transform: 'none', width }}
            variant='text'
          />
      }
    </Grid>
  );
}

export default React.memo(FormatPrice);
