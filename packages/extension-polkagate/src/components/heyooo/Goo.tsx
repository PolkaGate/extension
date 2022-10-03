// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

interface Props {
  moreOnClick: () => void;
  goOnClick: () => void;
}

export default function Goo({ goOnClick, moreOnClick }: Props): React.ReactElement<Props> {
  return (
    <Grid
      container
      direction='column'
      xs={1.5}
    >
      <Grid
        item
        m='auto'
        width='fit-content'
      >
        <IconButton
          sx={{ p: 0 }}
          onClick={moreOnClick}
        >
          <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
        </IconButton>
      </Grid>
      <Grid
        container
        direction='row'
        mt='5px'
        item
        justifyContent='center'
      >
        <IconButton
          sx={{ p: 0 }}
          onClick={goOnClick}
        >
          <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: '#BA2882', strokeWidth: 2 }} />
        </IconButton>
      </Grid>
    </Grid >
  );
}
