// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
// @ts-ignore
import { Circle, CubeGrid, WanderingCubes, Wordpress } from 'better-react-spinkit';
import React from 'react';

interface Props {
  direction?: 'column' | 'row'
  fontSize?: number;
  titlePaddingTop?: number;
  titlePaddingLeft?: number;
  title?: string;
  pt?: number | string;
  size?: number;
  gridSize?: number;
  type?: 'circle' | 'cubes' | 'grid' | 'wordpress';
}

function Progress({ direction = 'column', fontSize = 13, gridSize = 135, pt = '50px', size = 25, title, titlePaddingTop = 20, titlePaddingLeft = 0, type = 'circle' }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  return (
    <Grid
      alignItems='center'
      container
      direction={direction}
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
      {type === 'wordpress' &&
        <Wordpress
          color={theme.palette.primary.main}
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
          size={gridSize}
          style={{ margin: 'auto', opacity: '0.4' }}
        />
      }
      {title &&
        <Grid
          item
          sx={{
            fontSize,
            pl: `${titlePaddingLeft}px`,
            pt: `${titlePaddingTop}px`
          }}
        >
          {title}
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Progress);
