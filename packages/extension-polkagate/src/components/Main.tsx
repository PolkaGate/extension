// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { RedGradient } from '../style';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Main ({ children, className }: Props): React.ReactElement<Props> {
  return (
    <main className={className}>
      <RedGradient style={{ top: '-35px' }} />
      {children}
    </main>
  );
}
