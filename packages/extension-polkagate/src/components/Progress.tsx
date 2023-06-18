// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React from 'react';

interface Props {
  fontSize?: number;
  title?: string;
  pt?: number | string;
  size?: number;
}

function Progress({ pt = '50px', title, size = 25, fontSize = 13 }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <Grid
      alignItems='center'
      container
      direction='column'
      justifyContent='center'
      pt={pt}
    >
      <Circle color={theme.palette.primary.main} scaleEnd={0.7} scaleStart={0.4} size={size} />
      <Grid
        item
        sx={{ fontSize, paddingTop: '20px' }}
      >
        {title}
      </Grid>
    </Grid>
  );
}

export default React.memo(Progress);
