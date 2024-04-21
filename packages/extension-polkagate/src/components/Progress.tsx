// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import { Circle, CubeGrid, WanderingCubes } from 'better-react-spinkit';
import React from 'react';

interface Props {
  fontSize?: number;
  title?: string;
  pt?: number | string;
  size?: number;
  type?: 'circle' | 'cubes' | 'grid';
}

function Progress({ fontSize = 13, pt = '50px', size = 25, title, type = 'circle' }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <Grid
      alignItems='center'
      container
      direction='column'
      justifyContent='center'
      pt={pt}
    >
      {type === 'circle' &&
        <Circle
          color={theme.palette.primary.main}
          scaleEnd={0.7}
          scaleStart={0.4}
          size={size}
        />
      }
      {type === 'cubes' &&
        <WanderingCubes
          color={theme.palette.primary.main}
          cubeSize={9}
          duration='2s'
          size={size}
          timingFunction='ease-in-out'
        />
      }
      {type === 'grid' &&
        <CubeGrid
          col={3}
          color={theme.palette.secondary.main}
          row={3}
          size={135}
          style={{ margin: 'auto', opacity: '0.4' }}
        />
      }
      {title &&
        <Grid
          item
          sx={{ fontSize, paddingTop: '20px' }}
        >
          {title}
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Progress);
