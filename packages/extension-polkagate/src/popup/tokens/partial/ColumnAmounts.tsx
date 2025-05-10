// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, useTheme } from '@mui/material';
import React, { memo } from 'react';

import { FormatBalance2, FormatPrice } from '../../../components';

interface ColumnAmountsProps {
  fiatAmount: number;
  cryptoAmount: BN;
  token: string;
  decimal: number;
  color?: string;
  placement?: 'left' | 'right';
}

export const ColumnAmounts = memo(function ColumnAmounts({ color, cryptoAmount, decimal, fiatAmount, placement = 'left', token }: ColumnAmountsProps) {
  const theme = useTheme();

  const contentPlacement = placement === 'left' ? 'flex-start' : 'flex-end';

  return (
    <Grid alignItems={contentPlacement} container direction='column' item width='fit-content'>
      <FormatPrice
        commify
        decimalColor={theme.palette.text.secondary}
        dotStyle='normal'
        fontFamily='Inter'
        fontSize='14px'
        fontWeight={600}
        height={18}
        num={fiatAmount}
        textColor={color}
        width='fit-content'
        withSmallDecimal
      />
      <FormatBalance2
        decimalPoint={2}
        decimals={[decimal]}
        style={{
          color: color || '#BEAAD8',
          fontFamily: 'Inter',
          fontSize: '12px',
          fontWeight: 500,
          width: 'max-content'
        }}
        tokens={[token]}
        value={cryptoAmount}
      />
    </Grid>
  );
});
