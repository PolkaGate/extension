// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Grid, Typography } from '@mui/material';
import React, { } from 'react';

interface Props {
  title: string;
  show: boolean;
  open: (title: 'Roles' | 'Commission') => void;
  children?: React.ReactElement;
}

export default function CollapseIt({ children, open, show, title }: Props): React.ReactElement {
  return (
    <Grid container direction='column' m='auto' width='92%'>
      <Grid container item justifyContent='space-between' onClick={() => open(title)} sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main', cursor: 'pointer' }}>
        <Typography fontSize='18px' fontWeight={400} lineHeight='40px'>
          {title}
        </Typography>
        <Grid alignItems='center' container item xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: show ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </Grid>
      </Grid>
      <Collapse in={show} sx={{ width: '100%' }} timeout='auto' unmountOnExit>
        {children}
      </Collapse>
    </Grid>
  );
}
