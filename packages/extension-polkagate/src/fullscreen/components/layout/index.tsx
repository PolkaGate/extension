// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, useTheme } from '@mui/material';
import React from 'react';

import { useFullscreen } from '@polkadot/extension-polkagate/src/hooks';

import { fullscreenBackground } from '../../../assets/img';
import Bread from './Bread';
import MainMenuColumn from './MainMenuColumn';
import TopRightActions from './TopRightActions';

interface Props {
  children?: React.ReactNode;
  childrenStyle?: React.CSSProperties;
  genesisHash?: string | undefined;
  selectedProxyAddress?: string | undefined;
  setShowProxySelection?: React.Dispatch<React.SetStateAction<boolean>>
  style?: React.CSSProperties;
}

function HomeLayout({ children, childrenStyle = {}, genesisHash, selectedProxyAddress, setShowProxySelection, style = {} }: Props): React.ReactElement {
  useFullscreen();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Container maxWidth={false} sx={{ alignItems: 'start', bgcolor: isDark ? theme.palette.background.default : '#CCD4EE', display: 'flex', height: '100vh', justifyContent: 'center', ...style }}>
      <Grid alignItems='flex-start' columnGap='25px' container justifyContent='flex-end' sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '24px', boxShadow: isDark ? 'none' : '0 12px 40px rgba(120, 130, 180, 0.16)', height: '100%', maxHeight: '100vh', minWidth: '1440px', overflow: 'hidden', p: '12px', position: 'relative', width: '1440px' }} wrap='nowrap'>
        <MainMenuColumn />
        <Grid
          container item position='relative'
          sx={{
            backgroundImage: `url(${fullscreenBackground})`,
            backgroundRepeat: 'no-repeat',
            borderRadius: '32px',
            display: 'block',
            width: '1100px'
          }}
        >
          <TopRightActions
            genesisHash={genesisHash}
            selectedProxyAddress={selectedProxyAddress}
            setShowProxySelection={setShowProxySelection}
          />
          <Bread />
          <Grid container item sx={{ ...childrenStyle }}>
            {children}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default React.memo(HomeLayout);
