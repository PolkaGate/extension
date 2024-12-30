// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { GradientBorder, RedGradient } from '../style';

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
  const ContainerStyle = {
    bgcolor: '#120D27',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '32px',
    boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
    position: 'relative',
    ...style
  } as SxProps<Theme>;

  return (
    <Container disableGutters sx={ContainerStyle}>
      <GradientBorder />
      <ContentWrapper>
        <RedGradient style={{ top: '-100px' }} />
        <Box position='relative' zIndex={1}>
          {children}
        </Box>
      </ContentWrapper>
    </Container>
  );
}

export default React.memo(GradientBox);
