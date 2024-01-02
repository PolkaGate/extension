// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

export default function ObserveResize(element: Element, maxSize: number, onResize: () => void): void {
  useEffect(() => {
    if (!element) {
      return;
    }

    const handleResize = () => {
      if (element?.clientHeight > maxSize) {
        onResize();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, [element, maxSize, onResize]);
}
