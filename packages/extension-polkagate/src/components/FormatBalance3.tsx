// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FormatBalanceProps } from './FormatBalance2';

import { Grid } from '@mui/material';
import React, { useMemo } from 'react';

import MySkeleton from './MySkeleton';
import { FormatBalance2 } from '.';

interface ExtendedFormatBalanceProps extends FormatBalanceProps{
  decimal?: number;
  token?: string;
}

interface Props{
  skeletonBgColor?: string;
  withSkeleton?: boolean;
  style?: React.CSSProperties;
  skeletonStyle?: React.CSSProperties;
  balanceStyle?: React.CSSProperties;
  balanceProps: Partial<ExtendedFormatBalanceProps>;
}

export default function FormatBalance ({ balanceProps, balanceStyle = {}, skeletonBgColor, skeletonStyle = {}, style = {}, withSkeleton = true }: Props): React.ReactElement {
  const adaptiveDecimalPoint = useMemo(() =>
    balanceProps.value && balanceProps.decimal && String(balanceProps.value).length >= balanceProps.decimal - 1
      ? 2
      : 4
  ,
  [balanceProps.decimal, balanceProps.value]);

  return (
    <Grid alignItems='center' container item justifyContent='flex-start' sx={{ width: '100%', ...style }}>
      {withSkeleton && balanceProps.value === undefined
        ? (
          <MySkeleton
            bgcolor={skeletonBgColor}
            style={{ ...skeletonStyle }}
          />)
        : (
          <FormatBalance2
            decimalPoint={adaptiveDecimalPoint}
            decimals= {[balanceProps?.decimal ?? 0]}
            tokens= {[balanceProps?.token ?? '']}
            {...balanceProps}
            style={{
              ...balanceStyle,
              width: 'max-content'
            }}
          />)
      }
    </Grid>
  );
}
