// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface FaderProps {
  width?: string;
  ratio?: number;
  showFade?: boolean;
  style?: React.CSSProperties;
}
interface Props extends FaderProps {
  containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
}

const Fader = styled('div', {
  shouldForwardProp: (prop) => prop !== 'width' && prop !== 'ratio' && prop !== 'showFade'
})<FaderProps>(({ showFade = false, style = {}, width = '105px' }) => {
  return {
    background: 'linear-gradient(270deg, #05091C 0%, rgba(5, 9, 28, 0) 100%)',
    bottom: 0,
    height: '100%',
    opacity: showFade ? 1 : 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    // top: 0,
    transition: 'opacity 0.1s ease-out',
    width,
    zIndex: 1,
    ...style
  };
});

function FadeOnScrollHorizontal({ containerRef, ratio, style, width }: Props) {
  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const [showFade, setShowFade] = useState<boolean>(false);

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
      ratio={ratio}
      showFade={showFade}
      style={style}
      width={width}
    />
  );
}

export default FadeOnScrollHorizontal;
