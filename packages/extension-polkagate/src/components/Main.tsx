// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useBackground, useScrollbarAutoHide } from '../hooks';

interface Props {
  children: React.ReactNode;
}

export default function Main ({ children }: Props): React.ReactElement<Props> {
  const background = useBackground();

  useScrollbarAutoHide();

  return (
    <main id='main' style={{ height: '100%', width: '100%' }}>
      {background}
      {children}
    </main>
  );
}
