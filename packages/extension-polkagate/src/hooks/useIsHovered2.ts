// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type MutableRefObject, useEffect, useRef, useState } from 'react';

export default function useIsHovered (): { isHovered: boolean, ref: MutableRefObject<HTMLElement | null> } {
  const ref = useRef<HTMLElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!ref?.current) {
      return;
    }

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const container = ref.current;

    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [ref]);

  return { isHovered, ref };
}
