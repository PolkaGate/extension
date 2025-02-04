// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React from 'react';

import { Background } from '../style';

interface Props {
  children: React.ReactNode;
}

export default function Main ({ children }: Props): React.ReactElement<Props> {
  return (
    <main id='main'>
      {/* <RedGradient id='gradientBackground' style={{ top: '-35px' }} /> */}
      <Background id='logoBackground' />
      {/* <LogoDropAnimation
        ground={210}
        id='dropsBackground'
        style={{
          bottom: '200px',
          left: 0,
          right: 0,
          top: 0
        }}
      /> */}
      {children}
    </main>
  );
}
