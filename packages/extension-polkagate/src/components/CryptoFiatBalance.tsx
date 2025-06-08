// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ComponentProps } from 'react';
import type { DotsStyle } from '@polkadot/extension-polkagate/src/components/Dots';
import type { BN } from '@polkadot/util';

import { Grid, Skeleton, useTheme } from '@mui/material';
import React, { memo } from 'react';

import { useIsBlueish } from '../hooks';
import { FormatBalance2, FormatPrice } from '.';

type FormatPriceProps = ComponentProps<typeof FormatPrice>;
type FormatBalance2Props = ComponentProps<typeof FormatBalance2>;

interface Props {
  cryptoBalance: BN | undefined;
  decimal: number | undefined;
  fiatBalance: number | undefined;
  fiatProps?: Partial<FormatPriceProps>;
  cryptoProps?: Partial<FormatBalance2Props>;
  token: string | undefined;
  style?: React.CSSProperties;
  whichFirst?: 'crypto' | 'fiat';
  skeletonColor?: string;
}

function MySkeleton ({ bgcolor, width }: { bgcolor: string, width: number }): React.ReactElement {
  return (
    <Skeleton
      animation='wave'
      height={12}
      sx={{ bgcolor, borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: `${width}px` }}
    />);
}

export function CryptoFiatBalance ({ cryptoBalance, cryptoProps, decimal = 0, fiatBalance, fiatProps, skeletonColor, style = {}, token = '', whichFirst = 'fiat' }: Props) {
  const theme = useTheme();
  const isBlueish = useIsBlueish();

  const isDark = theme.palette.mode === 'dark';
  const balanceColor = isDark
    ? isBlueish ? theme.palette.text.primary : '#BEAAD8'
    : '#291443';
  const priceColor = isDark ? '#BEAAD8' : '#8F97B8';

  const balanceStyle = {
    color: balanceColor,
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '10px',
    width: 'max-content'
  };

  const _balanceProps = {
    decimalPoint: 2,
    decimals: [decimal],
    tokens: [token],
    value: cryptoBalance,
    ...cryptoProps,
    style: { ...balanceStyle, ...cryptoProps?.style }
  };

  const _priceProps = {
    commify: true,
    decimalColor: theme.palette.text.secondary,
    dotStyle: 'normal' as DotsStyle,
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: 600,
    height: 18,
    num: fiatBalance,
    skeletonHeight: 14,
    width: 'fit-content',
    ...fiatProps
  };

  const renderBalances = () => whichFirst === 'fiat'
    ? <>
      <FormatPrice {..._priceProps} />
      <FormatBalance2 {..._balanceProps} />
    </>
    : <>
      <FormatBalance2 {..._balanceProps} />
      <FormatPrice {..._priceProps} />
    </>;

  return (
    <Grid container direction='column' item sx={{ '> div.balance': { color: priceColor, ...theme.typography['S-2'] }, alignItems: 'start', rowGap: '6px', width: 'fit-content', ...style }}>
      {(!cryptoBalance || fiatBalance === undefined)
        ? <Grid alignItems='flex-end' container direction='column' item sx={{ rowGap: '6px', width: '100%' }}>
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
          {renderBalances()}
        </>
      }
    </Grid>
  );
}

export default memo(CryptoFiatBalance);
