// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Box, Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { backgroundLogoDarkMode, backgroundLogoLightMode } from '../assets/logos';
import { useIsDark } from '../hooks';

const BallStyle: React.CSSProperties = {
  borderRadius: '50%',
  height: '128px',
  opacity: 1,
  position: 'absolute',
  width: '128px'
};

const RedBall = styled('div')(() => ({
  ...BallStyle,
  backgroundColor: '#b30a0a',
  filter: 'blur(90px)', // Glow effect
  left: '35%',
  top: '-60px'
}));

const BlueBall = styled('div')(() => ({
  ...BallStyle,
  backgroundColor: '#5B00B6',
  filter: 'blur(100px)', // Glow effect
  left: '-35px',
  top: '-45px'
}));

const backgroundImageStyle: SxProps<Theme> = {
  backdropFilter: 'blur(20px)',
  height: '452.63px',
  left: '26px',
  mixBlendMode: 'color-dodge',
  position: 'absolute',
  rotate: '0deg',
  top: '-129px',
  width: '344.77px'
};

const FadeOut = styled('div')(() => ({
  background: 'linear-gradient(180deg, transparent 13.79%, background.default 100%)',
  height: '220px',
  inset: 0,
  position: 'absolute',
  width: '375px'
}));

const Smoother = styled('div')(() => ({
  background: 'linear-gradient(0deg,rgba(118, 113, 163, 0.7) 0%, #080610 100%)',
  height: '200px',
  inset: 0,
  maskMode: 'alpha',
  opacity: 0.05,
  position: 'absolute',
  width: '375px'
}));

interface Props {
  style?: React.CSSProperties;
  id?: string;
}

function Background ({ id, style }: Props): React.ReactNode {
  const isDark = useIsDark();

  return (
    <Box id={id} sx={{ height: '220px', inset: 0, position: 'absolute', ...style }}>
      <Container disableGutters sx={{ height: '220px', overflow: 'hidden', position: 'relative', width: '100%' }}>
        <RedBall />
        <BlueBall />
        <Smoother />
        <Box
          component='img'
          src={ (isDark ? backgroundLogoDarkMode : backgroundLogoLightMode) as string}
          sx={backgroundImageStyle}
        />
      </Container>
      <FadeOut />
    </Box>
  );
}

export default Background;
