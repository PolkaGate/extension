// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Grid, IconButton } from '@mui/material';
import React from 'react';

interface Props {
  moreOnClick: () => void;
  goOnClick: () => void;
}

export default function AccountFeatures({ goOnClick, moreOnClick }: Props): React.ReactElement<Props> {
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
          onClick={moreOnClick}
          sx={{ p: 0 }}
        >
          <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
        </IconButton>
      </Grid>
      <Grid
        container
        direction='row'
        item
        justifyContent='center'
        mt='5px'
      >
        <IconButton
          onClick={goOnClick}
          sx={{ p: 0 }}
        >
          <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: '#BA2882', strokeWidth: 2 }} />
        </IconButton>
      </Grid>
    </Grid >
  );
}
