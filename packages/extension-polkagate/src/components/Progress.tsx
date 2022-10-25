// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CircularProgress, Grid } from '@mui/material';
import React from 'react';
import { Circle } from 'better-react-spinkit';

interface Props {
  title?: string;
  pt?: number | string;
  size?: number;
}

function Progress({ pt = '50px', title, size = 25 }: Props): React.ReactElement<Props> {
  return (
    <Grid
      alignItems='center'
      container
      direction='column'
      justifyContent='center'
      pt={pt}
    >
      <Circle color='white' scaleEnd={0.7} scaleStart={0.4} size={size} />
      <Grid
        item
        sx={{ fontSize: 13, paddingTop: '20px' }}
      >
        {title}
      </Grid>
    </Grid>
  );
}

export default React.memo(Progress);
