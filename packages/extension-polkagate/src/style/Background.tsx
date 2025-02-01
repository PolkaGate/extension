// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { BackgroundLogo } from '../assets/logos';

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
  filter: 'blur(8px)',
  height: '300px',
  mixBlendMode: 'color-dodge',
  position: 'absolute',
  px: '15px',
  rotate: '15deg',
  top: '-30px',
  width: '375px'
};

const FadeOut = styled('div')(() => ({
  background: 'linear-gradient(180deg, transparent 13.79%, #05091C 100%)',
  height: '220px',
  inset: 0,
  position: 'absolute',
  width: '375px'
}));

// const SmootherStyle = {
//   background: 'linear-gradient(0deg, #7671A3 0%, #080610 100%)',
//   height: '200px',
//   inset: 0,
//   maskMode: 'alpha',
//   opacity: 0.05,
//   position: 'absolute',
//   width: '375px'
// } as React.CSSProperties;

interface Props {
  style?: React.CSSProperties;
  id?: string;
}

function Background ({ id, style }: Props): React.ReactNode {
  return (
    <Box id={id} sx={{ height: '220px', inset: 0, position: 'absolute', ...style }}>
      <Container disableGutters sx={{ height: '220px', overflow: 'hidden', position: 'relative', width: '100%' }}>
        <RedBall />
        <BlueBall />
        {/* <div style={SmootherStyle} /> */}
        <Box
          component='img'
          src={BackgroundLogo as string}
          sx={backgroundImageStyle}
        />
      </Container>
      <FadeOut />
    </Box>
  );
}

export default Background;
