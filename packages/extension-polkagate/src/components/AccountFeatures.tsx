// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Grid, IconButton, useTheme } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

interface Props {
  menuOnClick: () => void;
  goToAccount: () => void;
  chain: Chain | null | undefined;
}

export default function AccountFeatures({ chain, goToAccount, menuOnClick }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <Grid container direction='column' sx={{ width: '10%' }}>
      <Grid item m='auto' width='fit-content'>
        <IconButton
          onClick={menuOnClick}
          sx={{ p: 0 }}
        >
          <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
        </IconButton>
      </Grid>
      <Grid container direction='row' item justifyContent='center' mt='5px'>
        <IconButton
          onClick={goToAccount}
          sx={{ p: 0 }}
        >
          <ArrowForwardIosRoundedIcon
            sx={{
              color: chain ? 'secondary.light' : 'action.disabledBackground',
              fontSize: '24px',
              stroke: chain ? `${theme.palette.secondary.light}` : `${theme.palette.action.disabledBackground}`,
              strokeWidth: 1.5
            }}
          />
        </IconButton>
      </Grid>
    </Grid>
  );
}
