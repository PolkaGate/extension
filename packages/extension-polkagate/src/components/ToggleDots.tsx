// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React from 'react';

interface ToggleDotsProps {
  active: boolean;
  size?: number;
  activeBallColor?: string;
  inActiveBallColor?: string;
}

export default function ToggleDots({ active, activeBallColor = '#FF4FB9', inActiveBallColor = '#674394CC', size = 10 }: ToggleDotsProps) {
  const dotStyle = {
    borderRadius: '999px',
    height: size,
    transition: 'transform 250ms ease',
    width: size
  };

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
      <div
        style={{
          ...dotStyle,
          backgroundColor: active ? activeBallColor : inActiveBallColor,
          transform: active ? 'scale(1.2)' : 'scale(0.8)'
        }}
      />
      <div
        style={{
          ...dotStyle,
          backgroundColor: active ? inActiveBallColor : activeBallColor,
          transform: active ? 'scale(0.8)' : 'scale(1.2)'
        }}
      />
    </div>
  );
}
