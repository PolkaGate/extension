// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, styled, type SxProps, type Theme, useTheme } from '@mui/material';
import React from 'react';

import { GradientBorder } from '../style';

// Background glass effect layer
const GlassBackground = styled(Box)(({ theme }) => ({
  '&::after': {
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '32px',
    boxShadow: '0 0 24px 8px rgba(78, 43, 114, 0.35) inset',
    content: '""',
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 0
  },

  '&::before': {
    background: theme.palette.gradient?.primary,
    content: '""',
    inset: 0,
    position: 'absolute',
    zIndex: 0
  },

  backdropFilter: 'blur(10px)',
  borderRadius: '32px',
  height: '100%',
  inset: 0,
  position: 'absolute',
  width: '100%'
}));

const ContentWrapper = styled(Box)({
  borderRadius: '32px',
  height: 'fit-content',
  margin: '0 auto',
  overflow: 'hidden',
  position: 'relative'
});

interface Props {
  children?: React.ReactNode;
  style?: SxProps<Theme>;
}

function GradientBox ({ children, style }: Props) {
  const theme = useTheme();

  return (
    <Container disableGutters sx={style}>
      <ContentWrapper>
        <GlassBackground theme={theme} />
        <GradientBorder />
        <Box position='relative' zIndex={1}>
          {children}
        </Box>
      </ContentWrapper>
    </Container>
  );
}

export default React.memo(GradientBox);
