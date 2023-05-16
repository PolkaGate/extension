// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
  topDivider?: boolean;
  title: string;
}

export default function DisplayValue({ children, title, topDivider = true }: Props): React.ReactElement<Props> {
  return (
    <Grid alignItems='center' container direction='column' justifyContent='center'>
      <Grid item>
        {topDivider && <Divider sx={{ bgcolor: 'secondary.main', height: '2px', my: '5px', width: '170px' }} />}
      </Grid>
      <Grid item>
        <Typography>
          {title}
        </Typography>
      </Grid>
      <Grid fontSize='28px' fontWeight={400} item>
        {children}
      </Grid>
    </Grid>
  );
}
