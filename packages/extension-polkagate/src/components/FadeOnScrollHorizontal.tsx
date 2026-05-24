// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { useIsDark } from '../hooks';

interface FaderProps {
  width?: string;
  ratio?: number;
  isDark?: boolean;
  showFade?: boolean;
  style?: React.CSSProperties;
}
interface Props extends FaderProps {
  containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
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
  shouldForwardProp: (prop) => prop !== 'isDark' && prop !== 'width' && prop !== 'ratio' && prop !== 'showFade'
})<FaderProps>(({ isDark = true, showFade = false, style = {}, width = '105px' }) => {
  const fadeBase = isDark ? '#05091C' : 'transparent';
  const fadeStart = toTransparent(fadeBase);
  const fadeMid = toAlpha(fadeBase, 0.28);
  const fadeStrong = toAlpha(fadeBase, 0.78);
  const { backgroundColor: _backgroundColor, ...restStyle } = style;

  return {
    WebkitBackdropFilter: 'blur(1px)',
    backdropFilter: 'blur(1px)',
    background: `linear-gradient(270deg, ${fadeStrong} 0%, ${fadeMid} 38%, ${fadeStart} 85%)`,
    bottom: 0,
    height: '100%',
    opacity: showFade ? 1 : 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    transition: 'opacity 0.1s ease-out',
    width,
    zIndex: 1,
    ...restStyle
  };
});

function FadeOnScrollHorizontal({ containerRef, ratio, style, width }: Props) {
  const isDark = useIsDark();
  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const [showFade, setShowFade] = useState<boolean>(false);
  const resolvedStyle = {
    ...style,
    backgroundColor: (style?.backgroundColor as string | undefined) ?? 'transparent'
  };

  // Use a ResizeObserver to detect content changes
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const checkScroll = () => {
      const container = containerRef.current;

      if (container) {
        const hasScroll = container.scrollWidth > container.clientWidth;
        const isAtRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 1;

        setIsScrollable(hasScroll);
        setShowFade(hasScroll && isAtRight);
      }
    };

    const container = containerRef.current;

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
  }, [containerRef]);

  if (!isScrollable) {
    return null;
  }

  return (
    <Fader
      isDark={isDark}
      ratio={ratio}
      showFade={showFade}
      style={resolvedStyle}
      width={width}
    />
  );
}

export default FadeOnScrollHorizontal;
