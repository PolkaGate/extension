// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description  this component is used to show an account balance in some pages like contributeToCrowdloan
 * */
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { Grid, Skeleton } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';

import { FLOATING_POINT_DIGIT } from '../util/constants';
import FormatBalance from './FormatBalance';
import { FormatBalance2 } from '.';

export interface Props {
  balance: Balance | string | BN | number | null | undefined;
  api?: ApiPromise | undefined;
  decimalPoint?: number;
  height?: number;
  skeletonWidth?: number;
  decimal?: number;
  token?: string;
  withCurrency?: boolean;
}

export default function ShowBalance({ api, balance, decimalPoint, withCurrency = true, height = 20, skeletonWidth = 90, decimal = undefined, token = undefined }: Props): React.ReactElement<Props> {
  return (
    <Grid alignItems='center' container justifyContent='center' width='fit-content'>
      {
        balance === undefined || !(api || (decimal && token))
          ? <Skeleton
            height={height}
            sx={{ display: 'inline-block', transform: 'none', width: `${skeletonWidth}px` }}
          />
          : decimal && token
            ? <FormatBalance2
              decimalPoint={decimalPoint || FLOATING_POINT_DIGIT}
              decimals={[decimal]}
              tokens={[token]}
              value={balance}
              withCurrency={withCurrency}
            />
            : api &&
            <FormatBalance
              api={api}
              decimalPoint={decimalPoint || FLOATING_POINT_DIGIT}
              value={balance}
              withCurrency={withCurrency}
            />
      }
    </Grid>
  );
}
