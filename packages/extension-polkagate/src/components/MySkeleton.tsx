// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton, type SkeletonProps, type SxProps, type Theme, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  bgcolor?: string;
  height?: number;
  style?: React.CSSProperties | SxProps<Theme>;
  animation?: SkeletonProps['animation'];
  variant?: SkeletonProps['variant'];
  width?: number | string;
}

function MySkeleton ({ animation, bgcolor, height = 12, style = {}, variant, width = 0 }: Props): React.ReactElement {
  const isDark = useTheme();
  const _width = typeof width === 'number' ? `${width}px` : width;

  return (
    <Skeleton
      animation={animation ?? 'wave'}
      sx={{
        bgcolor: bgcolor ?? (isDark ? '#946CC840' : '#99A1C440'),
        borderRadius: '50px',
        display: 'inline-block',
        fontWeight: 'bold',
        height: `${height}px`,
        transform: 'none',
        width: _width,
        ...style
      }}
      variant={variant ?? 'text'}
    />);
}

export default React.memo(MySkeleton);
