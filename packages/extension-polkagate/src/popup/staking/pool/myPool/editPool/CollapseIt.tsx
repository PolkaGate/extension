// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

interface Props {
  title: string;
  show: boolean;
  open: (title: string) => void;
  children?: React.ReactElement;
  fullWidth?: boolean;
}

export default function CollapseIt({ children, fullWidth, open, show, title }: Props): React.ReactElement {
  const theme = useTheme();

  const handleClick = useCallback(() => open(title), [open, title]);

  return (
    <Grid container direction='column' m='auto' width={fullWidth ? '100%' : '92%'}>
      <Grid container item justifyContent='space-between' onClick={handleClick} sx={{ borderBottom: '1px solid', borderBottomColor: 'divider', cursor: 'pointer' }}>
        <Typography fontSize='18px' fontWeight={400} lineHeight='40px'>
          {title}
        </Typography>
        <Grid alignItems='center' container item xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: show ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </Grid>
      </Grid>
      <Collapse in={show} sx={{ width: '100%' }} timeout='auto' unmountOnExit>
        {children}
      </Collapse>
    </Grid>
  );
}
