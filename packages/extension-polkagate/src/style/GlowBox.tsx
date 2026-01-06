// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, styled, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { useIsDark, useIsExtensionPopup } from '../hooks';
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

const GlowBall = styled('div')<{ staking: boolean }>(({ staking }) => ({
  backgroundBlendMode: 'color-dodge',
  backgroundColor: staking ? '#59CDFF' : '#FF59EE',
  borderRadius: '50%',
  filter: staking ? 'blur(85px)' : 'blur(60px)', // Glow effect
  height: '128px',
  left: '35%',
  position: 'absolute',
  top: '-75px',
  width: '100px'
}));

const FadeOut = styled('div')<{ isDark: boolean }>(({ isDark }) => ({
  background: isDark
    ? 'linear-gradient(180deg, transparent 13.79%, #05091C 100%)'
    : '',
  height: '160px',
  inset: 0,
  position: 'absolute',
  width: '100%'
}));

const Fade = styled('div')({
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  height: '220px',
  inset: 0,
  position: 'absolute',
  width: '100%'
});

const FadeOutFs = styled('div')<{ isDark: boolean }>(({ isDark }) => ({
  background: isDark
    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'
    : '',
  borderRadius: '24px',
  height: '158px',
  inset: 0,
  position: 'absolute',
  width: '100%'
}));

interface GlowDividerProps {
  staking: boolean;
  shortSideDividers: boolean;
  isDark: boolean;
  placement: 'right' | 'left';
}

function GlowDivider({ isDark, placement, shortSideDividers, staking }: GlowDividerProps): React.ReactElement {
  const stakingStyle = staking
    ? { background: 'linear-gradient(180deg, rgba(16, 16, 25, 0.1) 0%, rgba(60, 196, 255, 0.5) 50.06%, transparent 100%)' }
    : {};

  const shortSideDividersStyle = shortSideDividers
    ? { bottom: '45px', height: '50%' }
    : {};

  return (
    <GradientDivider
      orientation='vertical'
      style={{
        bottom: 0,
        height: isDark ? '65%' : '110%',
        left: placement === 'left' ? 0 : undefined,
        m: 'auto',
        position: 'absolute',
        right: placement === 'right' ? 0 : undefined,
        top: 0,
        width: '2px',
        zIndex: 1,
        ...stakingStyle,
        ...shortSideDividersStyle
      }}
    />
  );
}

interface Props {
  showTopBorder?: boolean;
  children: React.ReactNode;
  style?: SxProps<Theme>;
  isBlueish?: boolean;
  shortSideDividers?: boolean; // Enables shorter side dividers used specifically in fullscreen mode.
}

function GlowBox({ children, isBlueish = false, shortSideDividers = false, showTopBorder = true, style }: Props): React.ReactElement {
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();

  const stakingStyle = isBlueish
    ? { background: 'linear-gradient(90deg, #1D0939 0%, #3CC4FF 50.06%, rgba(29, 9, 57, 0) 100%)' }
    : {};

  return (
    <Container disableGutters sx={{ border: '2px solid transparent', borderRadius: '24px', display: 'grid', height: 'fit-content', mx: '8px', position: 'relative', width: 'calc(100% - 16px)', zIndex: 1, ...style }}>
      {children}
      <GlowBoxContainer disableGutters>
        {showTopBorder &&
          <GradientBorder style={{ width: '311px', ...stakingStyle }} type='pinkish' />}
        <GlowDivider isDark={isDark} placement='left' shortSideDividers={shortSideDividers} staking={isBlueish} />
        <GlowDivider isDark={isDark} placement='right' shortSideDividers={shortSideDividers} staking={isBlueish} />
        {isDark &&
          <GlowBall staking={isBlueish} />
        }
        {isExtension
          ? <>
            {!isBlueish && <Fade />}
            <FadeOut isDark={isDark} />
          </>
          : <FadeOutFs isDark={isDark} />
        }
      </GlowBoxContainer>
    </Container>
  );
}

export default GlowBox;
