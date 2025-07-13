// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { FormatBalanceProps } from './FormatBalance2';

import { Grid, Skeleton } from '@mui/material';
import React from 'react';

import { useChainInfo } from '../hooks';
import { FormatBalance2 } from '.';

export interface Props {
  balance: Balance | string | BN | null | undefined;
  balanceProps?: Partial<FormatBalanceProps>
  decimal?: number;
  decimalPoint?: number;
  genesisHash?: string | undefined;
  height?: number;
  skeletonWidth?: number;
  skeletonStyle?: React.CSSProperties;
  token?: string;
}

export default function ShowBalance4 ({ balance, balanceProps, decimal, decimalPoint, genesisHash, height = 12, skeletonStyle = {}, token }: Props): React.ReactElement<Props> {
  const { decimal: nativeAssetDecimal, token: nativeAssetToken } = useChainInfo(genesisHash, true);
  const adaptiveDecimalPoint = balance && decimal ? (String(balance).length >= decimal - 1 ? 2 : 4) : undefined;
  const _decimalPoint = decimalPoint || adaptiveDecimalPoint;

  const _decimal = decimal || nativeAssetDecimal;
  const _token = token || nativeAssetToken;

  return (
    <Grid alignItems='center' container justifyContent='center' width='fit-content'>
      {!balance || !_decimal || !_token
        ? <Skeleton
          animation='wave'
          height={height}
          sx={{ borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '90px', ...skeletonStyle }}
        />
        : <FormatBalance2
          decimalPoint={_decimalPoint}
          decimals={[_decimal]}
          tokens={[_token]}
          value={balance}
          {...balanceProps}
        />
      }
    </Grid>
  );
}
