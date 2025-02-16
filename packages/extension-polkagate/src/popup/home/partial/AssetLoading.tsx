// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Skeleton } from '@mui/material';
import React from 'react';

import { logoWhiteTransparent } from '../../../assets/logos';
import { Drawer } from './TokensAssetsBox';

function Loading ({ noDrawer }: { noDrawer?: boolean }): React.ReactElement {
  return (
    <div>
      <Grid container item sx={{ background: '#05091C', borderRadius: '14px', p: '10px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex' }}>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ transition: 'all 250ms ease-out' }} xs>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <Box
                component='img'
                src={logoWhiteTransparent as string}
                sx={{
                  bgcolor: '#292247',
                  borderRadius: '999px',
                  filter: 'brightness(0.4)',
                  height: '36px',
                  p: '4px',
                  width: '36px'
                }}
              />
              <Grid container direction='column' item sx={{ rowGap: '8px', width: 'fit-content' }}>
                <Skeleton
                  animation='wave'
                  height={12}
                  sx={{ bgcolor: '#946CC826', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '30px' }}
                />
                <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
                  <Skeleton
                    animation='wave'
                    height={12}
                    sx={{ bgcolor: '#946CC840', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '45px' }}
                  />
                  <Skeleton
                    animation='wave'
                    height={12}
                    sx={{ bgcolor: '#BEAAD826', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '25px' }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid alignItems='flex-end' container direction='column' item sx={{ rowGap: '6px', width: 'fit-content' }}>
              <Skeleton
                animation='wave'
                height={12}
                sx={{ bgcolor: '#B094D340', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '70px' }}
              />
              <Skeleton
                animation='wave'
                height={12}
                sx={{ bgcolor: '#946CC826', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '50px' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Grid>
      {!noDrawer && <Drawer length={2} />}
    </div>
  );
}

function AssetLoading ({ itemsCount = 4, noDrawer = false }: { itemsCount?: number; noDrawer?: boolean; }) {
  return (
    <div style={{ display: 'grid', position: 'relative', rowGap: '10px', zIndex: 1 }}>
      {Array.from({ length: itemsCount }).map((_, index) => (
        <Loading key={index} noDrawer={noDrawer} />
      ))}
    </div>
  );
}

export default AssetLoading;
