// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, u64, u128 } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { INumber } from '@polkadot/types-codec/types';
import type { DotsVariant } from './Dots';

import { Fade, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { memo, useMemo } from 'react';

import { type BN, formatBalance } from '@polkadot/util';

import { useChainInfo, useIsDark, useIsHideNumbers } from '../hooks';
import { FLOATING_POINT_DIGIT } from '../util/constants';
import { Dots, MySkeleton } from '.';

const THOUSAND_LENGTH = 4;
const DEFAULT_DECIMAL_PRECISION = 2;
const HIGH_PRECISION_DECIMAL = 4;

function createElement(prefix: string, postfix: string, unit: string, isShort = false, decimalPoint: number, tokenColor?: string): React.ReactNode {
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

function applyFormat(
  decimalPoint: number,
  value: Balance | Compact<u128 | u64 | INumber> | BN | string,
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
    const minor = rest.substring(0, decimalPoint);
    const unit = rest.substring(4);

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
  api?: ApiPromise | null;
  balance: Balance | Compact<u128 | u64 | INumber> | string | BN | null | undefined;
  decimal?: number;
  decimalColor?: string;
  decimalPoint?: number;
  dotStyle?: DotsVariant;
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

function DisplayBalance({ api, balance, decimal, decimalColor, decimalPoint, dotStyle, genesisHash, isShort, skeletonStyle, style, token, tokenColor, useAdaptiveDecimalPoint, withCurrency, withSi }: DisplayBalanceProps) {
  const isDark = useIsDark();
  const theme = useTheme();
  const { isHideNumbers } = useIsHideNumbers();

  const { decimal: nativeDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

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

  const adaptiveDecimalPoint = useMemo(() =>
    balance && resolvedDecimal
      ? (String(balance).length >= resolvedDecimal - 1
        ? DEFAULT_DECIMAL_PRECISION
        : HIGH_PRECISION_DECIMAL)
      : undefined
    , [balance, resolvedDecimal]);

  const resolvedDecimalPoint = useMemo(() => {
    if (decimalPoint) {
      return decimalPoint;
    }

    if (useAdaptiveDecimalPoint && adaptiveDecimalPoint) {
      return adaptiveDecimalPoint;
    }

    return FLOATING_POINT_DIGIT;
  }, [adaptiveDecimalPoint, decimalPoint, useAdaptiveDecimalPoint]);

  const isLoading = balance === undefined || balance === null || !resolvedDecimal || !resolvedToken;

const _balance = useMemo<Balance | undefined>(() => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (!api || balance === undefined || balance === null) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return api.registry.createType('Balance', balance) as Balance;
}, [api, balance]);

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

  return (
    <Fade in={true} timeout={1000}>
      <div>
        {isHideNumbers
          ? (
            <Dots
              //@ts-ignore
              color={style?.color as string || tokenColor}
              decimalColor={decimalColor}
              variant={dotStyle}
            />
          )
          : (
            <Typography sx={{ ...theme.typography['B-1'], width: 'fit-content', ...style }}>
              {
                _balance?.toHuman() ??
                applyFormat(resolvedDecimalPoint, balance, resolvedDecimal, resolvedToken, withCurrency, withSi, isShort, tokenColor)
              }
            </Typography>
          )
        }
      </div>
    </Fade>
  );
}

export default memo(DisplayBalance);
