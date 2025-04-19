// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React from 'react';

import { homeBackgroundEffect } from '../../../assets/img';
import Bread from './Bread';
import MainMenuColumn from './MainMenuColumn';
import TopRightActions from './TopRightActions';

interface Props {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

function Layout ({ children, style = {} }: Props): React.ReactElement {
  return (
    <Container maxWidth={false} sx={{ alignItems: 'center', display: 'flex', height: '100vh', justifyContent: 'center', ...style }}>
      <Grid alignItems='flex-start' columnGap='10px' container justifyContent='flex-end' sx={{ bgcolor: '#05091C', borderRadius: '24px', height: '788px', minWidth: '1440px', overflowX: 'auto', p: '12px', position: 'relative', width: '1440px' }} wrap='nowrap'>
        <MainMenuColumn />
        <Grid
          container item position='relative'
          sx={{
            backgroundImage: `url(${homeBackgroundEffect})`,
            backgroundRepeat: 'no-repeat',
            borderRadius: '32px',
            display: 'block',
            // height: 'inherit',
            width: '1100px'
          }}
        >
          <TopRightActions />
          <Bread />
          <Grid container item>
            {children}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default React.memo(Layout);
