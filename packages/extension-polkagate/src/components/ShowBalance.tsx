// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description  this component is used to show an account balance in some pages like contributeToCrowdloan
 * */
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { GridDirection, Skeleton } from '@mui/material';
import { ResponsiveStyleValue } from '@mui/system';
import React from 'react';

import { ApiPromise } from '@polkadot/api';

import FormatBalance from './FormatBalance';

export interface Props {
  balance: Balance | string | BN | null | undefined;
  api: ApiPromise | undefined;
  title?: string;
  direction?: ResponsiveStyleValue<GridDirection> | undefined;
  decimalPoint?: number;
  height?: number;
  skeletonWidth?: number;
}

export default function ShowBalance({ api, balance, decimalPoint, height = 20, skeletonWidth = 90 }: Props): React.ReactElement<Props> {
  return (
    <>
      {balance !== undefined && api
        ? <FormatBalance
          api={api}
          decimalPoint={decimalPoint}
          value={balance} />
        : <Skeleton
          height={height}
          sx={{ display: 'inline-block', transform: 'none', width: `${skeletonWidth}px` }}
        />
      }
    </>
  );
}
