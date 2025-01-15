// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Skeleton, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { memo, useMemo } from 'react';

import { useCurrency, useIsHideNumbers } from '../hooks';
import { amountToHuman } from '../util/utils';

type DisplayStyle = 'portfolio' | 'asset' | '24h';

interface Props {
  displayStyle?: DisplayStyle;
  amount?: string | number | BN | null;
  decimal?: number;
  decimalPartCount?: number;
  fontStyle?: SxProps<Theme>;
}

interface FormattedValue {
  integer: string | undefined | null;
  decimal: string | undefined | null;
}

const DEFAULT_DECIMAL_PLACES = 2;

const Dots = () => {
  const theme = useTheme();

  return (
    <>
      <Typography sx={{ fontFamily: 'Inter', fontSize: '40px', fontWeight: 900, lineHeight: '35px', paddingLeft: '5px' }}>
        • •
      </Typography>
      <Typography px='3px' sx={{ color: theme.palette.text.secondary, fontFamily: 'Inter', fontSize: '25px', fontWeight: 400, lineHeight: '30px', px: '5px' }}>
        .
      </Typography>
      <Typography sx={{ fontFamily: 'Inter', fontSize: '40px', fontWeight: 900, lineHeight: '35px' }}>
        • •
      </Typography>
    </>
  );
};

const formatValue = (input: Props['amount'], decimal?: number, decimalPlaces: number = DEFAULT_DECIMAL_PLACES): FormattedValue => {
  if (input === null) {
    return { decimal: null, integer: null };
  }

  if (input === undefined) {
    return { decimal: undefined, integer: undefined };
  }

  try {
    const numericValue = typeof input === 'string'
      ? parseFloat(input)
      : typeof input === 'number'
        ? input
        : parseFloat(amountToHuman(input, decimal));

    if (isNaN(numericValue)) {
      return { decimal: undefined, integer: undefined };
    }

    const [integerPart, decimalPart = undefined] = numericValue
      .toFixed(decimalPlaces)
      .split('.');

    return {
      decimal: decimalPart,
      integer: parseInt(integerPart).toLocaleString()
    };
  } catch (error) {
    console.error('Error formatting currency value:', error);

    return { decimal: undefined, integer: undefined };
  }
};

const useStyles = (displayStyle: DisplayStyle = 'asset') => {
  const theme = useTheme();
  const { decimalFontSize, fontFamily, fontWeight, integerFontSize } = useMemo(() => {
    const fontFamily = displayStyle === 'portfolio'
      ? 'OdibeeSans'
      : 'Inter';

    const decimalFontSize = displayStyle === 'portfolio'
      ? '25px'
      : displayStyle === 'asset'
        ? '14px'
        : '13px';

    const integerFontSize = displayStyle === 'portfolio'
      ? '40px'
      : displayStyle === 'asset'
        ? '14px'
        : '13px';

    const fontWeight = displayStyle === 'portfolio'
      ? 400
      : displayStyle === 'asset'
        ? 600
        : 500;

    return {
      decimalFontSize,
      fontFamily,
      fontWeight,
      integerFontSize
    };
  }, [displayStyle]);

  return useMemo(() => ({
    comma: {
      color: theme.palette.text.secondary
    },
    decimal: {
      color: theme.palette.text.secondary,
      fontFamily,
      fontSize: decimalFontSize,
      fontWeight,
      lineHeight: displayStyle === 'portfolio' ? '25px' : '14px'
    },
    integer: {
      color: '#fff',
      fontFamily,
      fontSize: integerFontSize,
      fontWeight,
      lineHeight: displayStyle === 'portfolio' ? '40px' : '14px'
    }
  }), [theme.palette.text.secondary, fontFamily, decimalFontSize, fontWeight, displayStyle, integerFontSize]);
};

const RenderSkeleton = memo(function RenderSkeleton ({ displayStyle = 'asset' }: { displayStyle: DisplayStyle }) {
  return (
    <Skeleton
      animation='wave'
      height={displayStyle === 'portfolio' ? '40px' : '14px'}
      sx={{ fontWeight: 'bold', transform: 'none', width: '100%' }}
      variant='text'
    />
  );
});

const RenderAmount = memo(function RenderAmount ({ displayStyle, value }: { value: string, displayStyle?: DisplayStyle }) {
  const styles = useStyles(displayStyle);

  return (
    <>
      {value.split(/(\d+|,)/).filter(Boolean).map((part, index) => (
        <Typography
          component='span'
          key={index}
          sx={{ ...styles.integer, ...(part === ',' ? styles.comma : {}) }}
        >
          {part}
        </Typography>
      ))}
    </>
  );
});

function CurrencyDisplay ({ amount, decimal, decimalPartCount = DEFAULT_DECIMAL_PLACES, displayStyle = 'asset', fontStyle }: Props): React.ReactElement {
  const currency = useCurrency();
  const { isHideNumbers } = useIsHideNumbers();
  const styles = useStyles(displayStyle);
  const { decimal: decimalPart, integer } = formatValue(amount, decimal, decimalPartCount);

  if (!integer && !decimalPart) {
    return <RenderSkeleton displayStyle={displayStyle} />;
  }

  const style = { '> p': { ...fontStyle }, '> span': { ...fontStyle } } as SxProps<Theme>;

  return (
    <Stack alignItems='baseline' direction='row' sx={style}>
      {currency?.sign && (
        <Typography component='span' sx={styles.integer}>
          {currency.sign}
        </Typography>
      )}
      {isHideNumbers
        ? <Dots />
        : (
          <>
            {integer &&
              <RenderAmount
                displayStyle={displayStyle}
                value={integer}
              />
            }
            {decimalPart &&
              <Typography component='span' sx={styles.decimal}>
                .{decimalPart}
              </Typography>
            }
          </>
        )}
    </Stack>
  );
}

export default CurrencyDisplay;
