// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, type SxProps, type Theme } from '@mui/material';
import React from 'react';

interface Props {
  style?: SxProps<Theme>;
}

export default function GradientDivider ({ style }: Props): React.ReactElement<Props> {
  return (
    <Divider
      sx={{
        background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
        height: '1px',
        width: '100%',
        ...style
      }}
    />
  );
}
