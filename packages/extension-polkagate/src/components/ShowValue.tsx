// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description  this component is used to show an account balance in some pages like contributeToCrowdloan
 * */

import React from 'react';

import MySkeleton from './MySkeleton';

export interface Props {
  value: number | string | null | undefined;
  height?: number;
  unit?: string;
  width?: string;
}

export default function ShowValue ({ height, unit = '', value, width = '90px' }: Props): React.ReactElement<Props> {
  return (
    <>
      {value !== undefined
        ? <>
          {value}{' '}{unit}
        </>
        : <MySkeleton
          height={height}
          style= {{ width }}
        />
      }
    </>
  );
}
