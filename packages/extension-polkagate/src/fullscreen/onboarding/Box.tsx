// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

const GlassCard = styled(Box)`
  position: relative;
  height: 500px;
  max-width: 450px;
  margin: 0 auto;
  border-radius: 32px;
  overflow: hidden;
  backdrop-filter: blur(10px);

  /* Container for gradients */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.5;
    background: 
      radial-gradient(
        circle at 95% 20%, 
        rgba(91, 0, 182, 0.2) 2%, 
        transparent 50%
      ),
      radial-gradient(
        circle at 2% 20%, 
        rgba(91, 0, 182, 0.2) 2%, 
        transparent 50%
      ),
      radial-gradient(
        circle at 50% 0%,
        rgba(255, 26, 177, 0.3) 5%,
        transparent 60%
      );
  }

  /* Border and shadow container */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    box-shadow: inset 0 0 24px 8px rgba(78, 43, 114, 0.35);
    pointer-events: none;
  }
`;

const GradientBorder = styled(Box)(() => ({
  background: `linear-gradient(
    262.56deg,
    rgba(236, 180, 255, 0) 22.53%,
    #ECB4FF 47.68%,
    #ECB4FF 62.78%,
    rgba(236, 180, 255, 0) 72.53%)`,
  height: '2px',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  width: '100%'
}));

interface Props {
  children?: React.ReactNode;
  style?: SxProps<Theme>;
}

export default function GradientBox ({ children, style }: Props) {
  return (
    <Container disableGutters sx={style}>
      <GlassCard>
        <GradientBorder />
        {children}
      </GlassCard>
    </Container>
  );
}
