// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description  this component is used to show an account balance in some pages like contributeToCrowdloan
 * */
import type { BN } from '@polkadot/util';

import { Skeleton } from '@mui/material';
import React from 'react';

export interface Props {
  value: number | string | BN | null | undefined;
  height?: number;
  unit?: string;
  width?: string;
}

export default function ShowValue({ height = 20, unit, value, width = '90px' }: Props): React.ReactElement<Props> {
  return (
    <>
      {value !== undefined
        ? <>
          {value}{' '}{unit}
        </>
        : <Skeleton
          animation='wave'
          height={height}
          sx={{ display: 'inline-block', transform: 'none', width: { width } }}
        />
      }
    </>
  );
}
