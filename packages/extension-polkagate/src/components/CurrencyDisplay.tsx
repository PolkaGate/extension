// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { memo, useMemo } from 'react';

import { useCurrency, useIsHideNumbers } from '../hooks';
import { amountToHuman } from '../util/utils';

type DisplayStyle = 'full' | 'minimal';

interface Props {
  displayStyle?: DisplayStyle;
  amount?: string | number | BN | null;
  decimal?: number;
  decimalPartCount?: number;
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
      <Typography style={{ fontFamily: 'Inter', fontSize: '40px', fontWeight: 900, lineHeight: '35px', paddingLeft: '5px' }}>
        • •
      </Typography>
      <Typography px='3px' sx={{ color: theme.palette.text.secondary, fontFamily: 'Inter', fontSize: '25px', fontWeight: 400, lineHeight: '40px', px: '5px' }}>
        .
      </Typography>
      <Typography style={{ fontFamily: 'Inter', fontSize: '40px', fontWeight: 900, lineHeight: '35px' }}>
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

const useStyles = (displayStyle: DisplayStyle = 'minimal') => {
  const theme = useTheme();

  return useMemo(() => ({
    comma: {
      color: theme.palette.text.secondary
    },
    decimal: {
      color: theme.palette.text.secondary,
      fontFamily: displayStyle === 'full' ? 'OdibeeSans' : 'Inter',
      fontSize: displayStyle === 'full' ? '25px' : '14px',
      fontWeight: displayStyle === 'full' ? 400 : 600,
      lineHeight: displayStyle === 'full' ? '25px' : '14px'
    },
    integer: {
      color: '#fff',
      fontFamily: displayStyle === 'full' ? 'OdibeeSans' : 'Inter',
      fontSize: displayStyle === 'full' ? '40px' : '14px',
      fontWeight: displayStyle === 'full' ? 400 : 600,
      lineHeight: displayStyle === 'full' ? '40px' : '14px'
    }
  }), [theme.palette.text.secondary, displayStyle]);
};

const RenderSkeleton = memo(function RenderSkeleton ({ displayStyle = 'minimal' }: { displayStyle: DisplayStyle }) {
  return (
    <Skeleton
      animation='wave'
      height={displayStyle === 'full' ? '40px' : '14px'}
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

function CurrencyDisplay ({ amount, decimal, decimalPartCount = DEFAULT_DECIMAL_PLACES, displayStyle = 'minimal' }: Props): React.ReactElement {
  const currency = useCurrency();
  const { isHideNumbers } = useIsHideNumbers();
  const styles = useStyles(displayStyle);
  const { decimal: decimalPart, integer } = formatValue(amount, decimal, decimalPartCount);

  if (!integer && !decimalPart) {
    return <RenderSkeleton displayStyle={displayStyle} />;
  }

  return (
    <Stack alignItems='baseline' direction='row'>
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
