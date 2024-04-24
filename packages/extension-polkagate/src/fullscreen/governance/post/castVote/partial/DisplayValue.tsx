// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
  dividerHeight?: string;
  topDivider?: boolean;
  title: string;
  childrenFontSize?: string;
}

export default function DisplayValue({ children, childrenFontSize = '28px', dividerHeight = '2px', title, topDivider = true }: Props): React.ReactElement<Props> {
  return (
    <Grid alignItems='center' container direction='column' justifyContent='center'>
      <Grid item>
        {topDivider &&
          <Divider sx={{ bgcolor: 'secondary.main', height: dividerHeight, my: '5px', width: '170px' }} />
        }
      </Grid>
      <Grid item>
        <Typography fontSize='16px' fontWeight={400}>
          {title}
        </Typography>
      </Grid>
      <Grid fontSize={childrenFontSize} fontWeight={400} item>
        {children}
      </Grid>
    </Grid>
  );
}
