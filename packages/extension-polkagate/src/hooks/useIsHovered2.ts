// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useRef, useState } from 'react';

export default function useIsHovered<T extends HTMLElement = HTMLDivElement>() {
  const [isHovered, setIsHovered] = useState(false);
  const currentNode = useRef<T | null>(null);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const ref = useCallback((node: T | null) => {
    // remove from previous node
    if (currentNode.current) {
      currentNode.current.removeEventListener('mouseenter', handleMouseEnter);
      currentNode.current.removeEventListener('mouseleave', handleMouseLeave);
    }

    // add to new node
    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    currentNode.current = node;
  }, [handleMouseEnter, handleMouseLeave]);

  return { isHovered, ref };
}
