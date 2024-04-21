// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Skeleton } from '@mui/material';
import React from 'react';

interface Props {
  height?: number;
  skeletonHeight?: number;
  mb?: number;
}

function Waiting ({ height, mb = 2, skeletonHeight = 25 }: Props): React.ReactElement<Props> {
  const _height = height || window.innerHeight - 100;
  const length = _height / skeletonHeight;
  const step = 100 / length;

  return (
    <Grid
      container
      justifyContent='center'
      mb={mb}
    >
      {Array.from({ length }).map((_, index) => (
        <Grid
          container
          key={index}
        >
          <Skeleton
            animation='wave'
            height={skeletonHeight}
            sx={{ my: '5px', transform: 'none', width: `${(index + 1) * step}%` }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default React.memo(Waiting);
