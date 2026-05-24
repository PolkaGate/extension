// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../hooks';
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
  isBlueish?: boolean;
  noGradient?: boolean;
}

function GradientBox({ children, isBlueish, noGradient = false, style }: Props) {
  const isDark = useIsDark();

  const ContainerStyle = {
    bgcolor: isDark ? '#120D27' : '#f8f8f8',
    border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '',
    borderRadius: '32px',
    boxShadow: isDark ? '0px 0px 24px 8px #4E2B7259 inset' : '0px 0px 24px 8px #EDDCFF59 inset',
    position: 'relative',
    ...style
  } as SxProps<Theme>;

  return (
    <Container disableGutters sx={ContainerStyle}>
      {isDark &&
        <GradientBorder
          style={{ top: '-2px' }}
          type={isBlueish ? 'blueish' : 'pastel'}
        />
      }
      <ContentWrapper>
        {
          !noGradient && isDark &&
          <RedGradient style={{ top: '-100px' }} />
        }
        <Box position='relative' zIndex={1}>
          {children}
        </Box>
      </ContentWrapper>
    </Container>
  );
}

export default React.memo(GradientBox);
