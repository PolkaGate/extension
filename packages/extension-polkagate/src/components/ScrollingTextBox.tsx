// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import { Box, styled, type SxProps, type Theme, Typography } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ScrollingTextBoxProps {
  text: string;
  width: number;
  style?: SxProps<Theme>;
  textStyle?: SxProps<Theme>;
  scrollOnHover?: boolean;
}

const BoxContainer = styled(Box)(({ maximumWidth, shouldScroll }: { shouldScroll: boolean; maximumWidth: number }) => ({
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
  maxWidth: `${maximumWidth}px`,
  overflow: 'hidden',
  position: 'relative',
  width: 'fit-content'
}));

function ScrollingTextBox({ scrollOnHover = false, style, text, textStyle, width }: ScrollingTextBoxProps): React.ReactElement {
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const uniqueKeyframeName = useMemo(() => `scrollText-${Math.random().toString(36).substring(2, 11)}`, []);

  useEffect(() => {
    if (scrollOnHover && !isHovering) {
      setShouldScroll(false);

      return;
    }

    if (textRef.current) {
      const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;

      setShouldScroll(isOverflowing);
      setTextWidth(textRef.current.scrollWidth);
    }
  }, [isHovering, scrollOnHover, text]);

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
    animationPlayState: scrollOnHover ? (isHovering ? 'running' : 'paused') : isHovering ? 'paused' : 'running',
    whiteSpace: 'nowrap'
  }), [animationDuration, isHovering, scrollOnHover, shouldScroll, textWidth, uniqueKeyframeName, width]);

  const toggleHover = useCallback(() => setIsHovering((isHovered) => !isHovered), []);

  return (
    <BoxContainer maximumWidth={width} onMouseEnter={toggleHover} onMouseLeave={toggleHover} shouldScroll={shouldScroll} sx={style}>
      <Typography ref={textRef} sx={{ ...textboxStyle, ...textStyle }}>
        {text}
      </Typography>
    </BoxContainer>
  );
}

export default memo(ScrollingTextBox);
