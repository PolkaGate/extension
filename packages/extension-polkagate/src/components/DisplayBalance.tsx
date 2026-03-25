// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, u64, u128 } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { INumber } from '@polkadot/types-codec/types';
import type { BN } from '@polkadot/util';
import type { DotsVariant } from './Dots';

import { Fade, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { type CSSProperties, memo, useMemo } from 'react';

import { formatBalance } from '@polkadot/util';

import { useChainInfo, useIsDark, useIsHideNumbers } from '../hooks';
import { toBN } from '../util';
import { Dots, MySkeleton } from '.';

function formatAdaptive(num: string, decimalPoint = 4): string {
  const [int, frac] = num.split('.');

  if (!frac) {
    return int;
  }

  const trimmed = frac
    .slice(0, decimalPoint)
    .replace(/0+$/, ''); // remove trailing zeros

  return trimmed ? `${int}.${trimmed}` : int;
}

interface DisplayBalanceProps {
  api?: ApiPromise;
  balance: Balance | Compact<u128 | u64 | INumber> | string | BN | null | undefined;
  decimal?: number;
  decimalColor?: string;
  decimalPoint?: number;
  dotStyle?: DotsVariant;
  genesisHash?: string | undefined;
  skeletonStyle?: SxProps<Theme>;
  style?: CSSProperties;
  token?: string;
  tokenColor?: string;
  useAdaptiveDecimalPoint?: boolean;
  withCurrency?: boolean;
  withSi?: boolean;
}

function DisplayBalance({ api, balance, decimal, decimalColor, decimalPoint, dotStyle, genesisHash, skeletonStyle, style, token, tokenColor, withCurrency = true, withSi }: DisplayBalanceProps) {
  const isDark = useIsDark();
  const theme = useTheme();
  const { isHideNumbers } = useIsHideNumbers();

  const { decimal: nativeDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

  const resolvedDecimal = useMemo(() =>
    decimal || nativeDecimal || api?.registry?.chainDecimals?.[0],
    [api?.registry?.chainDecimals, decimal, nativeDecimal]);

  const resolvedToken = useMemo(() =>
    token || nativeToken || api?.registry?.chainTokens?.[0],
    [api?.registry?.chainTokens, nativeToken, token]);

  const isLoading = balance === undefined || balance === null || !resolvedDecimal || !resolvedToken;
  const maybeToken = withCurrency ? resolvedToken : '';

  if (isLoading) {
    return (
      <MySkeleton
        bgcolor={isDark ? '#946CC826' : '#99A1C459'}
        height={15}
        style={skeletonStyle}
        width={90}
      />
    );
  }

  const formattedWithSi = formatBalance(balance, { decimals: resolvedDecimal, withSi, withUnit: maybeToken, withZero: false });
  const [num, unit = maybeToken] = formattedWithSi.split(' ');

  const isZero = !balance || toBN(balance).isZero();
  const displayNum = isZero
    ? '0.00'
    : decimalPoint ? formatAdaptive(num, decimalPoint) : num;

    const { maxWidth, width, ...restStyle } = style || {};

  return (
    <Fade in={true} timeout={1000}>
      <div style={{ maxWidth, width }}>
        {isHideNumbers
          ? (
            <Dots
              // @ts-ignore
              color={style?.color as string || tokenColor}
              decimalColor={decimalColor}
              variant={dotStyle}
            />
          )
          : (
            <Typography sx={{ ...theme.typography['B-1'], width: 'fit-content', ...restStyle }}>
              {displayNum}
              <span style={{ color: tokenColor ?? 'inherit' }}>
                {` ${unit}`}
              </span>
            </Typography>
          )
        }
      </div>
    </Fade>
  );
}

export default memo(DisplayBalance);
