// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ComponentProps } from 'react';
import type { DotsVariant } from '@polkadot/extension-polkagate/src/components/Dots';
import type { BN } from '@polkadot/util';

import { Grid, useTheme } from '@mui/material';
import React, { memo, useMemo } from 'react';

import { useIsBlueish, useIsDark } from '../hooks';
import { DisplayBalance, FormatPrice, MySkeleton } from '.';

type FormatPriceProps = ComponentProps<typeof FormatPrice>;
type DisplayBalanceProps = ComponentProps<typeof DisplayBalance>;

interface Props {
  cryptoBalance: BN | undefined;
  decimal: number | undefined;
  fiatBalance: number | undefined;
  fiatProps?: Partial<FormatPriceProps>;
  cryptoProps?: Partial<DisplayBalanceProps>;
  token: string | undefined;
  style?: React.CSSProperties;
  whichFirst?: 'crypto' | 'fiat';
  skeletonColor?: string;
  skeletonAlignment?: 'flex-start' | 'flex-end';
}

function CryptoFiatBalance ({ cryptoBalance, cryptoProps, decimal = 0, fiatBalance, fiatProps, skeletonAlignment = 'flex-end', skeletonColor, style = {}, token = '', whichFirst = 'fiat' }: Props) {
  const theme = useTheme();
  const isBlueish = useIsBlueish();
  const isDark = useIsDark();

  const balanceColor = useMemo(() => isDark
    ? isBlueish ? theme.palette.text.primary : '#BEAAD8'
    : '#291443'
  , [isBlueish, isDark, theme.palette.text.primary]);
  const priceColor = useMemo(() => isDark ? '#BEAAD8' : '#8F97B8', [isDark]);

  const balanceStyle = useMemo(() => ({
    color: balanceColor,
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '10px',
    width: 'max-content'
  }), [balanceColor]);

  const _balanceProps = useMemo(() => ({
    balance: cryptoBalance,
    decimal,
    decimalPoint: 2,
    token,
    ...cryptoProps,
    style: { ...balanceStyle, ...cryptoProps?.style }
  }), [balanceStyle, cryptoBalance, cryptoProps, decimal, token]);

  const _priceProps = useMemo(() => ({
    commify: true,
    decimalColor: theme.palette.text.secondary,
    dotStyle: 'normal' as DotsVariant,
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: 600,
    height: 18,
    num: fiatBalance,
    skeletonHeight: 14,
    width: 'fit-content',
    ...fiatProps
  }), [fiatBalance, fiatProps, theme.palette.text.secondary]);

  const renderBalances = useMemo(() => whichFirst === 'fiat'
    ? <>
      <FormatPrice {..._priceProps} />
      <DisplayBalance {..._balanceProps} />
    </>
    : <>
      <DisplayBalance {..._balanceProps} />
      <FormatPrice {..._priceProps} />
    </>, [_balanceProps, _priceProps, whichFirst]);

  return (
    <Grid container direction='column' item sx={{ '> div.balance': { color: priceColor, ...theme.typography['S-2'] }, alignItems: 'start', rowGap: '6px', width: 'fit-content', ...style }}>
      {(!cryptoBalance || fiatBalance === undefined)
        ? <Grid alignItems={skeletonAlignment} container direction='column' item sx={{ rowGap: '6px', width: '100%' }}>
          <MySkeleton
            bgcolor={isDark ? skeletonColor ?? '#946CC826' : '#99A1C440'}
            width={70}
          />
          <MySkeleton
            bgcolor={isDark ? skeletonColor ?? '#946CC826' : '#99A1C459'}
            width={50}
          />
        </Grid>
        : <>
          {renderBalances}
        </>
      }
    </Grid>
  );
}

export default memo(CryptoFiatBalance);
