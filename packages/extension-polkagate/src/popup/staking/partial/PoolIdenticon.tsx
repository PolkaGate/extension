// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../util/types';

import { Box } from '@mui/material';
import React, { useMemo } from 'react';

import { logoPink } from '@polkadot/extension-polkagate/src/assets/logos/index';

import { PolkaGateIdenticon } from '../../../style';

interface Props {
  poolInfo: PoolInfo | undefined;
  size?: number;
}

export const PoolIdenticon = ({ poolInfo, size = 24 }: Props) => {
  const isPolkagate = poolInfo?.metadata?.toLocaleLowerCase().includes('polkagate');

  return useMemo(() => (
    isPolkagate
      ? (
        <Box
          component='img'
          src={logoPink as string}
          sx={{ height: size, width: size }}
        />)
      : (
        <PolkaGateIdenticon
          address={poolInfo?.stashIdAccount?.accountId.toString() ?? ''}
          size={size}
        />)
  ), [isPolkagate, poolInfo?.stashIdAccount?.accountId, size]);
};
