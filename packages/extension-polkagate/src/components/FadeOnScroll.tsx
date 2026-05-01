// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useIsDark } from '../hooks';

interface FaderProps {
  height?: string;
  ratio?: number;
  isDark?: boolean;
  showFade?: boolean;
  style?: React.CSSProperties;
}
interface Props extends FaderProps {
  backgroundColor?: React.CSSProperties['backgroundColor'];
  containerRef: React.RefObject<HTMLElement | null> | null;
  showAnyway?: boolean;
}

function toTransparent(color: string): string {
  if (color.startsWith('#')) {
    if (color.length === 7) {
      return `${color}00`;
    }

    if (color.length === 9) {
      return `${color.slice(0, 7)}00`;
    }
  }

  const rgbMatch = color.match(/^rgb\((.+)\)$/i);

  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, 0)`;
  }

  const rgbaMatch = color.match(/^rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/i);

  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},0)`;
  }

  return 'transparent';
}

function toAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    if (color.length === 7) {
      const normalized = Math.max(0, Math.min(255, Math.round(alpha * 255))).toString(16).padStart(2, '0');

      return `${color}${normalized}`;
    }

    if (color.length === 9) {
      const normalized = Math.max(0, Math.min(255, Math.round(alpha * 255))).toString(16).padStart(2, '0');

      return `${color.slice(0, 7)}${normalized}`;
    }
  }

  const rgbMatch = color.match(/^rgb\((.+)\)$/i);

  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${alpha})`;
  }

  const rgbaMatch = color.match(/^rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/i);

  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},${alpha})`;
  }

  return `rgba(255,255,255,${alpha})`;
}

const Fader = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDark' && prop !== 'height' && prop !== 'ratio' && prop !== 'showFade'
})<FaderProps>(({ height = '105px', isDark = true, ratio = 0.6, showFade = false, style = {} }) => {
  const backgroundBase = style?.backgroundColor as string | undefined;
  const fadeBase = backgroundBase ?? (isDark ? '#05091c' : 'transparent');
  const fadeStart = toTransparent(fadeBase);
  const fadeMid = toAlpha(fadeBase, 0.28);
  const fadeStrong = toAlpha(fadeBase, 0.78);
  const { backgroundColor: _backgroundColor, ...restStyle } = style;

  return {
    WebkitBackdropFilter: 'blur(1px)',
    backdropFilter: 'blur(1px)',
    background: `linear-gradient(0deg, ${fadeStrong} 0%, ${fadeMid} 38%, ${fadeStart} ${Math.max(100 - (ratio * 100), 15)}%)`,
    bottom: 0,
    height,
    left: 0,
    opacity: showFade ? 1 : 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    transition: 'opacity 0.1s ease-out',
    width: '100%',
    zIndex: 1,
    ...restStyle
  };
});

function FadeOnScroll({ backgroundColor, containerRef, height, ratio, showAnyway = false, style }: Props) {
  const isDark = useIsDark();

  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const [showFade, setShowFade] = useState<boolean>(false);

  // Use a ResizeObserver to detect content changes
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (showAnyway) {
      return;
    }

    const checkScroll = () => {
      const container = containerRef?.current;

      if (container) {
        const hasScroll = container.scrollHeight > container.clientHeight;
        const isAtBottom = container.scrollTop + container.clientHeight < container.scrollHeight - 1;

        setIsScrollable(hasScroll);
        setShowFade(hasScroll && isAtBottom);
      }
    };

    const container = containerRef?.current;

    if (container) {
      // Initial check
      checkScroll();

      // Set up event listener for scrolling
      container.addEventListener('scroll', checkScroll);

      // Set up ResizeObserver to detect content changes
      resizeObserverRef.current = new ResizeObserver(() => {
        checkScroll();
      });

      // Observe both the container and its children
      resizeObserverRef.current.observe(container);

      // Optional: observe children changes with MutationObserver
      const mutationObserver = new MutationObserver(checkScroll);

      mutationObserver.observe(container, {
        characterData: true,
        childList: true,
        subtree: true
      });

      return () => {
        container.removeEventListener('scroll', checkScroll);
        resizeObserverRef.current?.disconnect();
        mutationObserver.disconnect();
      };
    }

    return undefined;
  }, [containerRef, showAnyway]);

  if (!isScrollable && !showAnyway) {
    return null;
  }

  return (
    <Fader
      height={height}
      isDark={isDark}
      ratio={ratio}
      showFade={showAnyway || showFade}
      style={backgroundColor ? { backgroundColor, ...style } : style}
    />
  );
}

export default FadeOnScroll;
