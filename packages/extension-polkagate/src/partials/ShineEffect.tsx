// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, keyframes } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ShineEffectProps {
  duration?: number; // ms (default: 1200)
  interval?: number; // ms (default: 6000)
  active?: boolean;
}

const shineKeyframes = keyframes`
  0% { left: -25%; }
  100% { left: 125%; }
`;

function ShineEffect ({ active = true, duration = 1200, interval = 6000 }: ShineEffectProps) {
  const [shine, setShine] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    const runShine = () => {
      setShine(true);
      setTimeout(() => setShine(false), duration);
    };

    runShine(); // Optional: run once immediately
    const intervalId = setInterval(runShine, interval);

    return () => clearInterval(intervalId);
  }, [active, duration, interval]);

  if (!shine) {
    return null;
  }

  return (
    <Box
      sx={{
        animation: `${shineKeyframes} ${duration}ms ease-in-out forwards`,
        background: 'linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)',
        bottom: '0',
        filter: 'blur(8px)',
        height: '100%',
        left: '-25%',
        pointerEvents: 'none',
        position: 'absolute',
        top: '0',
        transform: 'rotate(120deg)',
        width: '25%'
      }}
    />
  );
}

export default ShineEffect;
