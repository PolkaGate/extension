// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../hooks';
import { GradientBorder, GradientDivider } from '.';

const GlowBoxContainer = styled(Container)(() => ({
  borderRadius: '24px',
  bottom: 0,
  height: '100%',
  left: 0,
  overflow: 'hidden',
  position: 'absolute',
  right: 0,
  top: 0,
  width: '100%',
  zIndex: -1
}));

const GlowBall = styled('div')({
  backgroundColor: '#FF59EE',
  borderRadius: '50%',
  filter: 'blur(60px)', // Glow effect
  height: '128px',
  left: '35%',
  position: 'absolute',
  top: '-75px',
  width: '100px'
});

const FadeOut = styled('div')<{ isDark: boolean }>(({ isDark }) => ({
  background: isDark
    ? 'linear-gradient(180deg, transparent 13.79%, #05091C 100%)'
    : '',
  height: '160px',
  inset: 0,
  position: 'absolute',
  width: '375px'
}));

const Fade = styled('div')({
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  height: '220px',
  inset: 0,
  position: 'absolute',
  width: '375px'
});

function GlowBox ({ children, showTopBorder = true, style }: { showTopBorder?: boolean, children: React.ReactNode, style?: SxProps<Theme> }): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Container disableGutters sx={{ border: '2px solid transparent', borderRadius: '24px', display: 'grid', height: 'fit-content', mx: '8px', position: 'relative', width: 'calc(100% - 16px)', zIndex: 1, ...style }}>
      {children}
      <GlowBoxContainer disableGutters>
        {showTopBorder && <GradientBorder style={{ width: '311px' }} type='pinkish' />}
        <GradientDivider orientation='vertical' style={{ bottom: 0, height: isDark ? '65%' : '110%', left: 0, m: 'auto', position: 'absolute', top: 0, width: '2px', zIndex: 1 }} />
        <GradientDivider orientation='vertical' style={{ bottom: 0, height: isDark ? '65%' : '110%', m: 'auto', position: 'absolute', right: 0, top: 0, width: '2px', zIndex: 1 }} />
        {isDark && <GlowBall />}
        <Fade />
        <FadeOut isDark={isDark} />
      </GlowBoxContainer>
    </Container>
  );
}

export default GlowBox;
