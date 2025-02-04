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
  amount?: string | number | BN | null | undefined;
  decimal?: number;
  decimalPartCount?: number;
  fontStyle?: SxProps<Theme>;
}

interface FormattedValue {
  integer: string | undefined | null;
  decimal: string | undefined | null;
}

const DEFAULT_DECIMAL_PLACES = 2;

const Dots = ({ displayStyle }: { displayStyle: DisplayStyle }) => {
  const theme = useTheme();

  const [height1, size1, weight1] = displayStyle === 'asset' ? [12, 14, 600] : [35, 40, 900];
  const [height2, size2, weight2] = displayStyle === 'asset' ? [12, 20, 400] : [30, 25, 400];

  const BigPart = ({ side }: { side: 'left' | 'right' }) => (
    <Typography sx={{ fontFamily: 'Inter', fontSize: `${size1}px`, fontWeight: weight1, lineHeight: `${height1}px`, paddingLeft: displayStyle === 'portfolio' ? '5px' : 0 }}>
      {displayStyle === 'portfolio'
        ? '• •'
        : side === 'left'
          ? '•,•••'
          : '••'
      }
    </Typography>
  );

  return (
    <>
      <BigPart side='left' />
      <Typography px='3px' sx={{ color: theme.palette.text.secondary, fontFamily: 'Inter', fontSize: `${size2}px`, fontWeight: weight2, lineHeight: `${height2}px`, px: displayStyle === 'portfolio' ? '5px' : 0 }}>
        .
      </Typography>
      <BigPart side='right' />
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
      height={displayStyle === 'portfolio' ? '24px' : '12px'}
      sx={{ fontWeight: 'bold', maxWidth: '245px', transform: 'none', width: '100%' }}
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

  if (integer === undefined && !decimalPart === undefined) {
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
        ? <Dots
          displayStyle={displayStyle}
        />
        : (
          <>
            <RenderAmount
              displayStyle={displayStyle}
              value={integer ?? '0'}
            />
            <Typography component='span' sx={styles.decimal}>
              .{decimalPart ?? '000'}
            </Typography>
          </>
        )}
    </Stack>
  );
}

export default CurrencyDisplay;
