// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, type SxProps, type Theme } from '@mui/material';
import React from 'react';

interface Props {
  style?: SxProps<Theme>;
  orientation?: 'horizontal' | 'vertical';
}

export default function GradientDivider ({ orientation = 'horizontal', style }: Props): React.ReactElement<Props> {
  const DividerStyle = {
    background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
    height: orientation === 'vertical' ? '100%' : '1px',
    width: orientation === 'vertical' ? '1px' : '100%'
  };

  return (
    <Divider
      orientation={orientation}
      sx={{
        ...DividerStyle,
        ...style
      }}
    />
  );
}
