// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useIsExtensionPopup } from '../hooks';
import { Background } from '../style';

interface Props {
  children: React.ReactNode;
}

export default function Main ({ children }: Props): React.ReactElement<Props> {
  const isExtensionMode = useIsExtensionPopup();

  return (
    <main id='main' style={{ height: '100%', width: '100%' }}>
      {isExtensionMode && <Background id='logoBackground' />}
      {children}
    </main>
  );
}
