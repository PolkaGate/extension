// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface FaderProps {
  height?: string;
  ratio?: number;
  showFade?: boolean;
  style?: React.CSSProperties;
}
interface Props extends FaderProps {
  containerRef: React.RefObject<HTMLElement | null> | null;
  showAnyway?: boolean;
}

const Fader = styled('div', {
  shouldForwardProp: (prop) => prop !== 'height' && prop !== 'ratio' && prop !== 'showFade'
})<FaderProps>(({ height = '105px', ratio = 0.6, showFade = false, style = {} }) => {
  const fadeHeight = parseInt(height); // Convert the height to a number (in pixels)

  return {
    background: `linear-gradient(0deg, #05091C 0%, #05091C ${fadeHeight * ratio}px, transparent 100%)`,
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
    ...style
  };
});

function FadeOnScroll ({ containerRef, height, ratio, showAnyway = false, style }: Props) {
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
      ratio={ratio}
      showFade={showAnyway || showFade}
      style={style}
    />
  );
}

export default FadeOnScroll;
