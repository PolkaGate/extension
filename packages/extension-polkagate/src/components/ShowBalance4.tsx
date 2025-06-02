// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description  this component is used to show an account balance in some pages like contributeToCrowdloan
 * */
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { FormatBalanceProps } from './FormatBalance2';

import { Grid, Skeleton } from '@mui/material';
import React from 'react';

import { useChainInfo } from '../hooks';
import { FLOATING_POINT_DIGIT } from '../util/constants';
import { FormatBalance2 } from '.';

export interface Props {
  balance: Balance | string | BN | null | undefined;
  decimalPoint?: number;
  genesisHash?: string | undefined;
  height?: number;
  skeletonWidth?: number;
  skeletonStyle?: React.CSSProperties;
  balanceProps?: Partial<FormatBalanceProps>
}

export default function ShowBalance4({ balance, balanceProps, decimalPoint, genesisHash, height = 12, skeletonStyle = {} }: Props): React.ReactElement<Props> {
  const { decimal, token } = useChainInfo(genesisHash, true);
  const adaptiveDecimalPoint = balance && decimal && (String(balance).length >= decimal - 1 ? 2 : 4);
  const _decimalPoint = decimalPoint || adaptiveDecimalPoint || FLOATING_POINT_DIGIT;

  return (
    <Grid alignItems='center' container justifyContent='center' width='fit-content'>
      {!balance || !decimal || !token
        ? <Skeleton
          animation='wave'
          height={height}
          sx={{ borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '90px', ...skeletonStyle }}
        />
        : <FormatBalance2
          decimalPoint={_decimalPoint}
          decimals={[decimal]}
          tokens={[token]}
          value={balance}
          {...balanceProps}
        />
      }
    </Grid>
  );
}
