// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';
import React, { useEffect, useState } from 'react';

const Fader = styled('div')(({ showFade }: { showFade: boolean }) => ({
  background: 'linear-gradient(0deg, #05091C 0%, #05091C 60%, transparent 100%)',
  bottom: 0,
  height: '105px',
  left: 0,
  opacity: showFade ? 1 : 0,
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  transition: 'opacity 0.1s ease-out',
  width: '100%',
  zIndex: 1
}));

function FadeOnScroll ({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const [showFade, setShowFade] = useState<boolean>(false);

  useEffect(() => {
    const checkScroll = () => {
      const container = containerRef.current;

      if (container) {
        const hasScroll = container.scrollHeight > container.clientHeight;
        const isAtBottom = container.scrollTop + container.clientHeight < container.scrollHeight - 1;

        setIsScrollable(hasScroll);
        setShowFade(hasScroll && isAtBottom);
      }
    };

    const container = containerRef.current;

    if (container) {
      checkScroll();

      container.addEventListener('scroll', checkScroll);
    }

    return () => {
      container?.removeEventListener('scroll', checkScroll);
    };
  }, [containerRef]);

  if (!isScrollable) {
    return null;
  }

  return (
    <Fader showFade={showFade} />
  );
}

export default FadeOnScroll;
