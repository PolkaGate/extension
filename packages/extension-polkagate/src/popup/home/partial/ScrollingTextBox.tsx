// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */
/* eslint-disable react/jsx-max-props-per-line */

import { Box, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface ScrollingTextBoxProps {
  text: string;
  width: number;
}

function ScrollingTextBox ({ text, width }: ScrollingTextBoxProps): React.ReactElement {
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;

      setShouldScroll(isOverflowing);
      setTextWidth(textRef.current.scrollWidth);
    }
  }, [text]);

  const animationDuration = Math.max(10, textWidth / 50); // Adjusts scrolling speed

  const containerStyle: SxProps<Theme> = {
    '&::after': {
      background: shouldScroll ? 'linear-gradient(90deg, transparent 0%, #591467 100%)' : undefined,
      right: 0
    },
    '&::before': {
      background: shouldScroll ? 'linear-gradient(90deg, #20123E 0%, transparent 100%)' : undefined,
      left: 0
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
    maxWidth: `${width}px`,
    overflow: 'hidden',
    position: 'relative',
    width: 'fit-content'
  };

  const textboxStyle: SxProps<Theme> = {
    '&:hover': {
      animationPlayState: 'paused'
    },
    '@keyframes scrollText': {
      '0%': { transform: 'translateX(0)' },
      '25%': { transform: `translateX(${width - textWidth}px)` },
      '50%': { transform: `translateX(${width - textWidth}px)` },
      '75%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(0)' }
    },
    animation: shouldScroll
      ? `scrollText ${animationDuration}s linear infinite`
      : 'none',
    whiteSpace: 'nowrap'
  };

  return (
    <Box sx={containerStyle}>
      <Typography ref={textRef} sx={textboxStyle}>
        {text}
      </Typography>
    </Box>
  );
}

export default ScrollingTextBox;
