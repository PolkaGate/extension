// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type RefObject, useEffect, useState } from 'react';

export default function useIsHovered (containerRef: RefObject<HTMLElement | HTMLDivElement | null> | null): boolean {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef?.current) {
      return;
    }

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const container = containerRef.current;

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  return isHovered;
}
