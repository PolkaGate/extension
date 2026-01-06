// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import { Box, styled, type SxProps, type Theme, Typography } from '@mui/material';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import { useIsHovered } from '../hooks';

interface ScrollingTextBoxProps {
  text: string;
  width: number;
  style?: SxProps<Theme>;
  textStyle?: SxProps<Theme>;
  scrollOnHover?: boolean;
}

const BoxContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'shouldScroll' && prop !== 'maxWidth'
})<{ shouldScroll: boolean; maxWidth: number }>(({ maxWidth, shouldScroll }) => ({
  '&::after': {
    background: shouldScroll ? 'linear-gradient(90deg, transparent 0%, #591467 100%)' : undefined,
    opacity: 0.3,
    right: 0
  },
  '&::before': {
    background: shouldScroll ? 'linear-gradient(90deg, #20123E 0%, transparent 100%)' : undefined,
    left: 0,
    opacity: 0.3
  },
  '&::before, &::after': {
    content: '""',
    height: '100%',
    position: 'absolute',
    top: 0,
    width: '13px',
    zIndex: 1
  },
  borderRadius: '8px',
  maxWidth: `${maxWidth}px`,
  overflow: 'hidden',
  position: 'relative',
  width: 'fit-content'
}));

function ScrollingTextBox({ scrollOnHover = false, style, text, textStyle, width }: ScrollingTextBoxProps): React.ReactElement {
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);
  const textRef = useRef<HTMLDivElement>(null);

  const [shouldScroll, setShouldScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  const uniqueKeyframeName = useMemo(() => `scrollText-${Math.random().toString(36).substring(2, 11)}`, []);

  useEffect(() => {
    if (scrollOnHover && !hovered) {
      setShouldScroll(false);

      return;
    }

    if (textRef.current) {
      const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;

      setShouldScroll(isOverflowing);
      setTextWidth(textRef.current.scrollWidth);
    }
  }, [hovered, scrollOnHover, text]);

  const animationDuration = useMemo(() => Math.max(10, textWidth / 50), [textWidth]); // Adjusts scrolling speed

  const textboxStyle: SxProps<Theme> = useMemo(() => ({
    '&:hover': {
      animationPlayState: scrollOnHover ? 'running' : 'paused'
    },
    [`@keyframes ${uniqueKeyframeName}`]: {
      '0%': { transform: 'translateX(0)' },
      '25%': { transform: `translateX(${width - textWidth}px)` },
      '50%': { transform: `translateX(${width - textWidth}px)` },
      '75%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(0)' }
    },
    animation: shouldScroll
      ? `${uniqueKeyframeName} ${animationDuration}s linear infinite`
      : 'none',
    animationPlayState: scrollOnHover ? (hovered ? 'running' : 'paused') : hovered ? 'paused' : 'running',
    whiteSpace: 'nowrap'
  }), [animationDuration, hovered, scrollOnHover, shouldScroll, textWidth, uniqueKeyframeName, width]);

  return (
    <BoxContainer maxWidth={width} ref={containerRef} shouldScroll={shouldScroll} sx={style}>
      <Typography ref={textRef} sx={{ ...textboxStyle, ...textStyle }}>
        {text}
      </Typography>
    </BoxContainer>
  );
}

export default memo(ScrollingTextBox);
