// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
import { Refresh2 } from 'iconsax-react';
import React from 'react';

export default function Reload ({ style }: { style: SxProps<Theme> }): React.ReactElement {
  return (
    <Grid
      alignItems='center'
      container
      item
      justifyContent='center'
      justifyItems='center'
      sx={{ ...style }}
    >
      <Refresh2
        color='#AA83DC'
        size={18}
        variant='Bold'
      />
      <Typography
        color='text.primary'
        pl='2px'
        pt='4px'
        variant='B-4'
      >
        Reload
      </Typography>
    </Grid >
  );
}
