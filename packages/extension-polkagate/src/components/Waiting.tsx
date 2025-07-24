// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Skeleton } from '@mui/material';
import React from 'react';

interface Props {
  height?: number;
  skeletonHeight?: number;
  mb?: number;
}

function Waiting({ height, mb = 2, skeletonHeight = 25 }: Props): React.ReactElement<Props> {
  const _height = height || window.innerHeight - 100;
  const length = _height / skeletonHeight;
  const percents = ['5%', '50%', '30%', '10%'];

  return (
    <Grid
      container
      justifyContent='center'
      mb={mb}
    >
      {Array.from({ length }).map((_, index) => {
        const shuffledPercents = percents.sort(() => Math.random() - 0.5);

        const partials = shuffledPercents.slice(1);

        return (
          <Grid
            alignItems='center'
            container
            key={index}
          >
            <Skeleton
              animation='pulse'
              height={skeletonHeight}
              sx={{ mr: '5px' }}
              variant='circular'
              width={skeletonHeight}
            />
            {partials.map((shuffled, index) => (
              <Skeleton
                animation='wave'
                height={skeletonHeight}
                key={index}
                sx={{ m: '5px 0 5px 5px' }}
                variant='rounded'
                width={shuffled}
              />
            ))}
          </Grid>
        );
      })}
    </Grid>
  );
}

export default React.memo(Waiting);
