// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, styled } from '@mui/material';
import React from 'react';

import { useIsDark } from '../hooks';

export const GlowBall = styled('div')({
  background: '#CC429D',
  borderRadius: '50%',
  filter: 'blur(25px)',
  height: '32px',
  left: 0,
  opacity: 1,
  pointerEvents: 'none', // Ensures the glow doesn't interfere with interactions
  position: 'absolute',
  top: 0,
  width: '32px'
});

interface VelvetBoxProp {
  children: React.ReactNode;
  childrenStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  noGlowBall?: boolean;
}

function VelvetBox({ children, childrenStyle = {}, noGlowBall = false, style = {} }: VelvetBoxProp) {
  const isDark = useIsDark();

  return (
    <Container
      disableGutters sx={{
        background: isDark ? '#1B133C' : '#F5F4FF',
        borderRadius: '18px',
        overflow: 'hidden',
        padding: '4px',
        position: 'relative',
        width: '100%',
        ...style
      }}
    >
      <div style={{ position: 'relative', width: '100%', zIndex: 1, ...childrenStyle }}>
        {children}
      </div>
      {
        !noGlowBall &&
        <GlowBall />
      }
    </Container>
  );
}

export default VelvetBox;
