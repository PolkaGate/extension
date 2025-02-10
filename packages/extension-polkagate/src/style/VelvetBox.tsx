// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

const GlowBall = styled('div')({
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

const VelvetBoxContainer = styled(Container)(() => ({
  background: '#1B133C',
  borderRadius: '18px',
  overflow: 'hidden',
  padding: '4px',
  position: 'relative',
  width: '100%'
}));

interface VelvetBoxProp {
  children: React.ReactNode;
  style?: SxProps<Theme>;
}

function VelvetBox ({ children, style }: VelvetBoxProp) {
  return (
    <VelvetBoxContainer disableGutters sx={style}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      <GlowBall />
    </VelvetBoxContainer>
  );
}

export default VelvetBox;
