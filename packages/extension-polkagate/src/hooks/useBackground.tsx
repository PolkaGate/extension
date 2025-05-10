// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { LogoDropAnimation } from '../partials';
import { Background } from '../style';

enum BACKGROUND {
  DEFAULT,
  DROPS,
  STAKING
}

export default function useBackground (backgroundType?: 'drops' | 'staking' | 'default'): React.ReactNode {
  const [background, setBackground] = useState<BACKGROUND>(BACKGROUND.DEFAULT);

  // Apply class if backgroundType is provided
  useEffect(() => {
    if (!backgroundType) {
      return;
    }

    const element = document.getElementById('main');

    if (element) {
      element.className = backgroundType;
    }
  }, [backgroundType]);

  // Observe class changes on #main
  useEffect(() => {
    const element = document.getElementById('main');

    if (!element) {
      return;
    }

    const observer = new MutationObserver(() => {
      const className = element.className;

      if (className.includes('drops')) {
        setBackground(BACKGROUND.DROPS);
      } else if (className.includes('staking')) {
        setBackground(BACKGROUND.STAKING);
      } else {
        setBackground(BACKGROUND.DEFAULT);
      }
    });

    observer.observe(element, { attributeFilter: ['class'], attributes: true });

    // Run it initially too
    const initialClass = element.className;

    if (initialClass.includes('drops')) {
      setBackground(BACKGROUND.DROPS);
    } else if (initialClass.includes('staking')) {
      setBackground(BACKGROUND.STAKING);
    } else {
      setBackground(BACKGROUND.DEFAULT);
    }

    return () => observer.disconnect();
  }, []);

  switch (background) {
    case BACKGROUND.DEFAULT:
      return <Background />;

    case BACKGROUND.DROPS:
      return <LogoDropAnimation />;

    case BACKGROUND.STAKING:
      return <Background type='staking' />;

    default:
      return <Background />;
  }
}
