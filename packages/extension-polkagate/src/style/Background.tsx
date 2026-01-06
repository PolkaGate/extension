// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, styled, type SxProps, type Theme, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { backgroundLogoDarkMode, backgroundLogoLightMode } from '../assets/logos';
import { useIsDark } from '../hooks';

const BallStyle: React.CSSProperties = {
  borderRadius: '50%',
  height: '128px',
  opacity: 1,
  position: 'absolute',
  transition: 'all 150ms ease-out',
  width: '128px'
};

const RedBall = styled('div')(({ type }: { type: 'default' | 'staking' }) => ({
  ...BallStyle,
  backgroundColor: type === 'default' ? '#b30a0a' : '#00C2FF',
  filter: 'blur(90px)', // Glow effect
  left: '35%',
  top: '-60px'
}));

const BlueBall = styled('div')(({ type }: { type: 'default' | 'staking' }) => ({
  ...BallStyle,
  backgroundColor: type === 'default' ? '#5B00B6' : '#0F00B6',
  filter: 'blur(100px)', // Glow effect
  left: '-35px',
  top: '-45px'
}));

const backgroundImageStyle: SxProps<Theme> = {
  backdropFilter: 'blur(20px)',
  height: '452.63px',
  left: '6px',
  mixBlendMode: 'color-dodge',
  position: 'absolute',
  rotate: '0deg',
  top: '-129px',
  width: '370px'
};

const FadeOut = styled('div')(({ backgroundColor }: { backgroundColor: string }) => ({
  background: `linear-gradient(180deg, transparent 13.79%, ${backgroundColor} 100%)`,
  height: '220px',
  inset: 0,
  position: 'absolute',
  transition: 'all 150ms ease-out',
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
  type?: 'default' | 'staking';
  imageStyle?: React.CSSProperties;
}

function Background({ imageStyle, style, type = 'default' }: Props): React.ReactNode {
  const theme = useTheme();
  const isDark = useIsDark();
  const [imageLoaded, setImageLoaded] = useState(false);

  const onLoad = useCallback(() => setImageLoaded(true), []);

  return (
    <Box sx={{ height: '220px', inset: 0, position: 'absolute', ...style }}>
      <Container disableGutters sx={{ height: '220px', overflow: 'hidden', position: 'relative', width: '100%' }}>
        <RedBall type={type} />
        <BlueBall type={type} />
        <Smoother />
        <Box
          component='img'
          onLoad={onLoad}
          src={(isDark ? backgroundLogoDarkMode : backgroundLogoLightMode) as string}
          style={imageStyle}
          sx={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 4s ease-in-out',
            ...backgroundImageStyle
          }}
        />
      </Container>
      <FadeOut backgroundColor={theme.palette.background.default} />
    </Box>
  );
}

export default Background;
