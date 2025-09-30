// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, useTheme } from '@mui/material';
import React, { memo } from 'react';

import { DisplayBalance, FormatPrice } from '../../../components';

interface ColumnAmountsProps {
  fiatAmount: number;
  cryptoAmount: BN;
  token: string;
  decimal: number;
  color?: string;
  placement?: 'left' | 'right';
  priceSecondColor?: string;
  balanceColor?: string;
}

export const ColumnAmounts = memo(function ColumnAmounts ({ balanceColor, color, cryptoAmount, decimal, fiatAmount, placement = 'left', priceSecondColor, token }: ColumnAmountsProps) {
  const theme = useTheme();

  const contentPlacement = placement === 'left' ? 'flex-start' : 'flex-end';

  return (
    <Grid alignItems={contentPlacement} container direction='column' item width='fit-content'>
      <FormatPrice
        commify
        decimalColor={priceSecondColor ?? theme.palette.text.secondary}
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
      <DisplayBalance
        balance={cryptoAmount}
        decimal={decimal}
        decimalPoint={2}
        style={{
          color: balanceColor || color || '#BEAAD8',
          width: 'max-content'
        }}
        token={token}
      />
    </Grid>
  );
});
