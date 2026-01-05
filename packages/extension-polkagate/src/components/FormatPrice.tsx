// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Fade, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';
import CountUp from 'react-countup';

import { HideNumberShape1, HideNumberShape2 } from '../fullscreen/home/HideNumberShapes';
import { useIsHideNumbers } from '../hooks';
import { amountToHuman, getDecimal } from '../util';
import { ASSETS_AS_CURRENCY_LIST } from '../util/currencyList';
import { CurrencyContext } from './contexts';
import Dots, { type DotsVariant } from './Dots';
import MySkeleton from './MySkeleton';

interface Props {
  amount?: BN | null;
  commify?: boolean;
  decimalColor?: string;
  decimalPoint?: number;
  decimals?: number;
  dotStyle?: DotsVariant;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  formattedFrom?: 'k' | 'M' | 'G' | 'T' | 'P' | 'E';
  height?: number;
  ignoreHide?: boolean; // ignore hide numbers
  lineHeight?: number;
  mt?: string;
  num?: number | string;
  onHideShape?: 'shape1' | 'shape2';
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
const LOOKUP = [
  { symbol: '', value: 1 },
  { symbol: 'k', value: 1e3 },
  { symbol: 'M', value: 1e6 },
  { symbol: 'G', value: 1e9 },
  { symbol: 'T', value: 1e12 },
  { symbol: 'P', value: 1e15 },
  { symbol: 'E', value: 1e18 }
];

export function nFormatter(num: number, decimalPoint: number) {
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = LOOKUP.slice().reverse().find((item) => num >= item.value);

  if (!item && num > 0) {
    return num.toFixed(decimalPoint).replace(rx, '$1');
  }

  return item ? (num / item.value).toFixed(decimalPoint).replace(rx, '$1') + item.symbol : '0';
}

const DecimalPart = ({ value, withCountUp }: { value: string | number, withCountUp: boolean | undefined }) => (
  withCountUp
    ? (
      <CountUp
        duration={1}
        end={Number(getDecimal(value))}
        prefix={'.'}
      />)
    : <>{`.${getDecimal(value)}`}</>
);

export function formatDecimalWithCommas(_number: number | string, decimalDigit = 2, commify?: boolean) {
  const sNumber = Number(_number) < 0 ? String(-Number(_number)) : String(_number);
  const dotIndex = sNumber.indexOf('.');

  if (dotIndex < 0) {
    const integerPart = sNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas for thousands

    return { decimalPart: '', integerPart }; // No decimal part
  }

  let integerDigits = sNumber.slice(0, dotIndex);
  const fractionalDigits = decimalDigit === 0 ? '' : sNumber.slice(dotIndex + 1, dotIndex + decimalDigit + 1);

  if (commify) {
    integerDigits = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas for thousands
  }

  return { decimalPart: fractionalDigits, integerPart: integerDigits };
}

function FormatPrice({ amount, commify, decimalColor, decimalPoint = 2, decimals, dotStyle, fontFamily, fontSize, fontWeight, formattedFrom, height, ignoreHide, lineHeight = 1, mt = '0px', num, onHideShape, price, sign, skeletonHeight = 15, style = {}, textAlign = 'left', textColor, width = '90px', withCountUp, withSmallDecimal }: Props): React.ReactElement<Props> {
  const { currency } = useContext(CurrencyContext);
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

  // Check if we should use nFormatter based on the formattedFrom prop
  const shouldUseNFormatter = useMemo(() => {
    if (!formattedFrom || total === undefined) {
      return false;
    }

    const threshold = LOOKUP.slice().reverse().find((item) => formattedFrom === item.symbol);

    return Math.abs(Number(total)) >= (threshold?.value || 0);
  }, [formattedFrom, total]);

  // Get the formatted value based on whether we should use nFormatter
  const formattedValue = useMemo(() => {
    if (total === undefined) {
      return undefined;
    }

    if (shouldUseNFormatter) {
      return nFormatter(Number(total), _decimalPoint);
    }

    return total;
  }, [total, shouldUseNFormatter, _decimalPoint]);

  const { decimalPart, integerPart } = shouldUseNFormatter
    ? { decimalPart: '', integerPart: String(formattedValue) }
    : formatDecimalWithCommas(total as number, _decimalPoint, commify);

  const mayCurrencySign = sign || currency?.sign || '';
  const formattedTotal = useMemo(() => (
    <>
      {mayCurrencySign}
      <span>
        {shouldUseNFormatter
          ? (
            <span style={{ color: textColor }}>
              {String(formattedValue).replace(mayCurrencySign, '')}
            </span>)
          : (
            <>
              {integerPart.split(',').map((part, idx, arr) => (
                <React.Fragment key={idx}>
                  <span key={`number-${idx}`} style={{ color: textColor }}>
                    {part}
                  </span>
                  {idx < arr.length - 1 && (
                    <span key={`comma-${idx}`} style={{ color: decimalColor || textColor || theme.palette.secondary.contrastText }}>
                      ,
                    </span>
                  )}
                </React.Fragment>
              ))}
              {decimalPart && (
                <span style={{ color: decimalColor || textColor || theme.palette.secondary.contrastText }}>
                  {'.'}{decimalPart}
                </span>
              )}
            </>
          )}
      </span>
    </>
  ), [decimalColor, decimalPart, integerPart, mayCurrencySign, textColor, theme.palette.secondary.contrastText, shouldUseNFormatter, formattedValue]);

  return (
    <Fade in={true} timeout={1000}>
      <Grid alignItems='center' container item mt={mt} sx={{ height, ...style }} textAlign={textAlign} width='fit-content'>
        {isHideNumbers && !ignoreHide
          ? (
            <>
              {
                onHideShape
                  ? onHideShape === 'shape1'
                    ? <HideNumberShape1 />
                    : onHideShape === 'shape2'
                      ? <HideNumberShape2 style={{ display: 'flex', justifyContent: 'end', width: '100%' }} />
                      : <></>
                  : (
                    <Dots
                      color={textColor}
                      decimalColor={decimalColor}
                      preText={mayCurrencySign}
                      preTextFontSize={fontSize}
                      preTextFontWeight={fontWeight}
                      variant={dotStyle}
                    />)
              }
            </>
          )
          : total !== undefined
            ? <Stack alignItems='baseline' direction='row' width='fit-content'>
              <Typography
                fontFamily={fontFamily}
                fontSize={fontSize}
                fontWeight={fontWeight}
                lineHeight={lineHeight}
                sx={{ color: textColor }}
              >
                {withCountUp && !shouldUseNFormatter
                  ? (
                    <CountUp
                      decimals={_decimalPoint}
                      duration={1}
                      end={parseFloat(String(total))}
                      prefix={sign || currency?.sign || ''}
                    />)
                  : <>
                    {formattedTotal}
                  </>
                }
              </Typography>
              {
                withSmallDecimal && Number(total) > 0 && !shouldUseNFormatter &&
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
            : (
              <MySkeleton
                height={skeletonHeight}
                style={{ borderRadius: '14px', width }}
              />)
        }
      </Grid>
    </Fade>
  );
}

export default React.memo(FormatPrice);
