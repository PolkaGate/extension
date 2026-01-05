// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React from 'react';

export default function Curve (): React.ReactElement {
  return (
    <Box
      sx={{
        borderBottom: '1px solid #2D1E4A',
        borderLeft: '1px solid #2D1E4A',
        borderRadius: '0 0 0 66%',
        height: '22px',
        left: '12px',
        position: 'absolute',
        top: '5px',
        width: '16px'
      }}
    />
  );
}
