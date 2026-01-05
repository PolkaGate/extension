// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid } from '@mui/material';
import React from 'react';

import { MySkeleton } from '@polkadot/extension-polkagate/src/components';

import { logoWhiteTransparent } from '../../../assets/logos';
import { useIsDark } from '../../../hooks/index';
import Drawer from './Drawer';

function Loading ({ noDrawer }: { noDrawer?: boolean }): React.ReactElement {
  const isDark = useIsDark();

  return (
    <div>
      <Grid container item sx={{ background: isDark ? '#05091C' : '#EDF1FF', borderRadius: '14px', p: '10px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex' }}>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ transition: 'all 250ms ease-out' }} xs>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <Box
                component='img'
                src={logoWhiteTransparent as string}
                sx={{
                  bgcolor: isDark ? '#292247' : '#CFD5F0',
                  borderRadius: '999px',
                  filter: isDark ? 'brightness(0.4)' : 'brightness(0.9)',
                  height: '36px',
                  p: '4px',
                  width: '36px'
                }}
              />
              <Grid container direction='column' item sx={{ rowGap: '8px', width: 'fit-content' }}>
                <MySkeleton
                  bgcolor={isDark ? '#946CC826' : '#99A1C459'}
                  width={30}
                />
                <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
                  <MySkeleton
                    bgcolor={isDark ? '#946CC840' : '#99A1C440'}
                    width={45}
                  />
                  <MySkeleton
                    bgcolor={isDark ? '#BEAAD826' : '#99A1C440'}
                    width={25}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid alignItems='flex-end' container direction='column' item sx={{ rowGap: '6px', width: 'fit-content' }}>
              <MySkeleton
                bgcolor={isDark ? '#B094D340' : '#99A1C440'}
                width={70}
              />
              <MySkeleton
                bgcolor={isDark ? '#946CC826' : '#99A1C459'}
                width={50}
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
