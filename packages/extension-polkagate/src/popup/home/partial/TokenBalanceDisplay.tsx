// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, useTheme } from '@mui/material';
import React, { } from 'react';

import { FormatBalance2, FormatPrice } from '../../../components';

export function TokenBalanceDisplay ({ decimal = 0, token = '', totalBalanceBN, totalBalancePrice }: { decimal?: number, totalBalanceBN: BN, totalBalancePrice: number, token?: string }) {
  const theme = useTheme();
  const balanceColor = theme.palette.mode === 'dark' ? '#BEAAD8' : '#291443';
  const priceColor = theme.palette.mode === 'dark' ? '#BEAAD8' : '#8F97B8';

  return (
    <Grid alignItems='flex-end' container direction='column' item sx={{ '> div.balance': { color: priceColor, ...theme.typography['S-2'] }, rowGap: '6px', width: 'fit-content' }}>
      <FormatPrice
        commify
        decimalColor={theme.palette.text.secondary}
        fontFamily='Inter'
        fontSize='14px'
        fontWeight={600}
        num={totalBalancePrice}
        skeletonHeight={14}
        width='fit-content'
      />
      <FormatBalance2
        decimalPoint={2}
        decimals={[decimal]}
        style={{
          color: balanceColor,
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '10px'
        }}
        tokens={[token]}
        value={totalBalanceBN}
      />
    </Grid>
  );
}
