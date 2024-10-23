// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

export default function useAnimateOnce (condition: boolean | undefined): boolean {
  const [animate, setAnimate] = useState(false);

  useEffect((): void => {
    if (condition) {
      setAnimate(true);

      setTimeout(() => setAnimate(false), 500);
    }
  }, [condition]);

  return animate;
}
