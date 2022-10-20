// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Grid, IconButton } from '@mui/material';
import React from 'react';

interface Props {
  menuOnClick: () => void;
  goToAccount: () => void;
}

export default function AccountFeatures ({ goToAccount, menuOnClick }: Props): React.ReactElement<Props> {
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
          onClick={menuOnClick}
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
          onClick={goToAccount}
          sx={{ p: 0 }}
        >
          <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: '#BA2882', strokeWidth: 2 }} />
        </IconButton>
      </Grid>
    </Grid>
  );
}
