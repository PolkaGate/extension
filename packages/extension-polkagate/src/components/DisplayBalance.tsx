// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, u64, u128 } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { INumber } from '@polkadot/types-codec/types';
import type { DotsVariant } from './Dots';

import { Fade, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { type CSSProperties, memo, useMemo } from 'react';

import { BN, BN_TEN, formatBalance } from '@polkadot/util';

import { useChainInfo, useIsDark, useIsHideNumbers } from '../hooks';
import { amountToHuman, toBN } from '../util';
import { Dots, MySkeleton } from '.';

/**
 * Trims a decimal string for UI display without hiding significance.
 *
 * For values >= 1, it keeps up to `decimalPoint` fractional digits and drops
 * trailing zeros. For values between 0 and 1, it preserves leading zeros after
 * the decimal point and keeps the first non-zero digit so tiny balances like
 * `0.0000123` do not collapse to `0`.
 *
 * Expects a plain decimal string such as the numeric part returned from
 * `amountToHuman` or `formatBalance`.
 */
function formatAdaptive(num: string, decimalPoint = 4): string {
  const [int, frac] = num.split('.');

  if (!frac) {
    return int;
  }

  if (int === '0') {
    const leadingZeros = frac.match(/^0*/)?.[0].length ?? 0;
    const digitsToKeep = Math.max(decimalPoint, leadingZeros + 1);
    const significantFraction = frac.slice(0, digitsToKeep).replace(/0+$/, '');

    return significantFraction ? `${int}.${significantFraction}` : int;
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

/**
 * Renders a chain balance with token metadata and UI-friendly formatting.
 *
 * The component resolves decimal precision and token symbol from explicit props,
 * chain metadata, or the provided API. While those inputs are unavailable, it
 * shows a skeleton placeholder. When `withSi` is enabled, very small non-zero
 * balances are formatted with SI units; otherwise the balance is rendered as a
 * human-readable decimal string and can be further trimmed with
 * `decimalPoint`/`formatAdaptive`.
 */
function DisplayBalance({ api, balance, decimal, decimalColor, decimalPoint, dotStyle, genesisHash, skeletonStyle, style, token, tokenColor, useAdaptiveDecimalPoint, withCurrency = true, withSi = true }: DisplayBalanceProps) {
  const isDark = useIsDark();
  const theme = useTheme();
  const { isHideNumbers } = useIsHideNumbers();

  const { decimal: nativeDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

  const resolvedDecimal = useMemo(() =>
    decimal ?? nativeDecimal ?? api?.registry?.chainDecimals?.[0],
    [api?.registry?.chainDecimals, decimal, nativeDecimal]);

  const resolvedToken = useMemo(() =>
    token ?? nativeToken ?? api?.registry?.chainTokens?.[0],
    [api?.registry?.chainTokens, nativeToken, token]);

  const maybeToken = withCurrency ? resolvedToken : '';
  const isLoading =
    balance === undefined ||
    balance === null ||
    resolvedDecimal === undefined ||
    resolvedDecimal === null ||
    (withCurrency && (resolvedToken === undefined || resolvedToken === null));

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

  const balanceBn = toBN(balance);
  const isZero = balanceBn.isZero();
  const smallSiThreshold = resolvedDecimal > 4
    ? BN_TEN.pow(new BN(resolvedDecimal - 4))
    : null;
  const largeSiThreshold = BN_TEN.pow(new BN(resolvedDecimal + 5));
  const shouldUseSi = Boolean(
    withSi &&
    !isZero &&
    (
      (smallSiThreshold && balanceBn.lt(smallSiThreshold)) ||
      balanceBn.gte(largeSiThreshold)
    )
  );
  const formattedBalance = shouldUseSi
    ? formatBalance(balance, { decimals: resolvedDecimal, withSi: true, withUnit: maybeToken, withZero: false })
    : `${amountToHuman(balance.toString(), resolvedDecimal, undefined, true)} ${maybeToken}`.trim();
  const [num, unit = maybeToken] = formattedBalance.trim().split(/\s+/);

  const displayNum = isZero
    ? '0.00'
    : useAdaptiveDecimalPoint
      ? formatAdaptive(num, decimalPoint)
      : typeof decimalPoint === 'number'
        ? formatAdaptive(num, decimalPoint)
        : num;

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
