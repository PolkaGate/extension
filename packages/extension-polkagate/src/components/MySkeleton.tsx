// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton, useTheme } from '@mui/material';
import React, { } from 'react';

interface Props {
  bgcolor?: string;
  height?: number;
  style?: React.CSSProperties;
  width?: number;
}

function MySkeleton ({ bgcolor, height = 12, style = {}, width = 0 }: Props): React.ReactElement {
  const isDark = useTheme();

  return (
    <Skeleton
      animation='wave'
      height={height}
      sx={{
        bgcolor: bgcolor ?? (isDark ? '#946CC840' : '#99A1C440'),
        borderRadius: '50px',
        display: 'inline-block',
        fontWeight: 'bold',
        transform: 'none',
        width: `${width}px`,
        ...style
      }}
    />);
}

export default React.memo(MySkeleton);
