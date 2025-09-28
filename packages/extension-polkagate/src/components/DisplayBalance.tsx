// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, u64, u128 } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Fade, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { memo, useMemo } from 'react';

import { type BN, formatBalance } from '@polkadot/util';

import { useChainInfo, useIsDark } from '../hooks';
import { FLOATING_POINT_DIGIT } from '../util/constants';

const THOUSAND_LENGTH = 4;
const DEFAULT_DECIMAL_PRECISION = 2;
const HIGH_PRECISION_DECIMAL = 4;

function createElement (prefix: string, postfix: string, unit: string, isShort = false, decimalPoint: number, tokenColor?: string): React.ReactNode {
  return (
    <>
      {`${prefix}${isShort ? '' : '.'}`}
      {!isShort &&
        <span className='ui--FormatBalance-postfix'>
          {`00${postfix?.slice(0, decimalPoint) || ''}`.slice(-decimalPoint)}
        </span>
      }
      <span className='ui--FormatBalance-unit' style={{ color: tokenColor ?? 'inherit' }}> {unit}</span>
    </>
  );
}

function applyFormat (
  decimalPoint: number,
  value: Balance | Compact<u128 | u64> | BN | string,
  decimal: number,
  token: string,
  withCurrency = true,
  withSi?: boolean,
  _isShort?: boolean,
  tokenColor?: string
): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { decimals: decimal, forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= THOUSAND_LENGTH);
  const unitPost = withCurrency ? token : '';

  if (prefix.length > THOUSAND_LENGTH) {
    const [major, rest] = formatBalance(value, { decimals: decimal, withUnit: false }).split('.');
    const minor = rest.substr(0, decimalPoint);
    const unit = rest.substr(4);

    return (
      <>
        {major}.
        <span className='ui--FormatBalance-postfix'>{minor}</span>
        <span className='ui--FormatBalance-unit' style={{ color: tokenColor ?? 'inherit' }}>{unit}{unit ? unitPost : ` ${unitPost}`}</span>
      </>
    );
  }

  return createElement(prefix, postfix, unitPost, isShort, decimalPoint, tokenColor);
}

interface DisplayBalanceProps {
  api?: ApiPromise;
  balance: Balance | Compact<u128 | u64> | string | BN | null | undefined;
  decimal?: number;
  decimalPoint?: number;
  genesisHash?: string | undefined;
  isShort?: boolean;
  skeletonStyle?: SxProps<Theme>;
  style?: SxProps<Theme>;
  token?: string;
  tokenColor?: string;
  useAdaptiveDecimalPoint?: boolean;
  withCurrency?: boolean;
  withSi?: boolean;
}

function DisplayBalance ({ api, balance, decimal, decimalPoint, genesisHash, isShort, skeletonStyle, style, token, tokenColor, useAdaptiveDecimalPoint, withCurrency, withSi }: DisplayBalanceProps) {
  const isDark = useIsDark();
  const theme = useTheme();
  const { decimal: nativeDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

  const adaptiveDecimalPoint = useMemo(() =>
    balance && decimal
      ? (String(balance).length >= decimal - 1
        ? DEFAULT_DECIMAL_PRECISION
        : HIGH_PRECISION_DECIMAL)
      : undefined
  , [balance, decimal]);

  const { apiDecimal, apiToken } = useMemo(() => {
    if (!api) {
      return { apiDecimal: undefined, apiToken: undefined };
    }

    return {
      apiDecimal: api.registry.chainDecimals[0],
      apiToken: api.registry.chainTokens[0]
    };
  }, [api]);

  const resolvedDecimal = useMemo(() => decimal || nativeDecimal || apiDecimal, [apiDecimal, decimal, nativeDecimal]);
  const resolvedToken = useMemo(() => token || nativeToken || apiToken, [apiToken, nativeToken, token]);
  const resolvedDecimalPoint = useMemo(() => {
    if (decimalPoint) {
      return decimalPoint;
    }

    if (useAdaptiveDecimalPoint && adaptiveDecimalPoint) {
      return adaptiveDecimalPoint;
    }

    return FLOATING_POINT_DIGIT;
  }, [adaptiveDecimalPoint, decimalPoint, useAdaptiveDecimalPoint]);

  if (balance === undefined || balance === null || !resolvedDecimal || !resolvedToken) {
    return (
      <Skeleton
        animation='wave'
        sx={{ bgcolor: isDark ? '#946CC826' : '#99A1C459', borderRadius: '50px', display: 'inline-block', height: '15px', transform: 'none', width: '90px', ...skeletonStyle }}
      />
    );
  }

  return (
    <Fade in={true} timeout={1000}>
      <Typography sx={{ ...theme.typography['B-1'], width: 'fit-content', ...style }}>
        {applyFormat(resolvedDecimalPoint, balance, resolvedDecimal, resolvedToken, withCurrency, withSi, isShort, tokenColor)}
      </Typography>
    </Fade>
  );
}

export default memo(DisplayBalance);
