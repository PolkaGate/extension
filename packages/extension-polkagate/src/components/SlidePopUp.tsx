// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Slide, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactElement<any, any>;
  show: boolean;
}

export default function SlidePopUp({ children, show }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const ref = React.useRef(null);

  return (
    <Grid
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='100%'
      justifyContent='end'
      ref={ref}
      sx={[{
        mixBlendMode: 'normal',
        overflowY: 'scroll',
        position: 'fixed',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0
        },
        top: 0
      }]}
      width='357px'
      zIndex={10}
    >
      <Slide
        container={ref.current}
        direction='up'
        in={show}
        mountOnEnter
        unmountOnExit
      >
        {children}
      </Slide>
    </Grid>
  );
}
