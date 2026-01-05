// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { logoTransparent } from '../assets/logos';

interface Drop {
  id: number;
  x: number;
  startTime: number;
}

interface Props {
  style?: React.CSSProperties;
  ground?: number;
}

const DROP_SPEED = 500;
const MAX_DROPS = 25;
const DROP_INTERVAL = 50;

function LogoDropAnimation ({ ground = 200, style }: Props) {
  const [drops, setDrops] = useState<Drop[]>([]);

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const lastDropTimeRef = useRef<number>(0);

  // Memoized drop cleanup function
  const cleanupDrops = useCallback((currentTime: number) => {
    setDrops((prevDrops) =>
      prevDrops.filter((drop) =>
        (currentTime - drop.startTime) < DROP_SPEED
      )
    );
  }, []);

  // Memoized drop creation function
  const createDrop = useCallback((currentTime: number) => {
    if (
      currentTime - lastDropTimeRef.current >= DROP_INTERVAL &&
      drops.length < MAX_DROPS
    ) {
      const newDrop = {
        id: Math.random(),
        startTime: currentTime,
        x: Math.floor(Math.random() * (75 - 15 + 1) + 15)
      };

      setDrops((prevDrops) => [...prevDrops, newDrop]);
      lastDropTimeRef.current = currentTime;
    }
  }, [drops.length]);

  // Animation loop using requestAnimationFrame
  const animate = useCallback((currentTime: number) => {
    if (previousTimeRef.current !== undefined) {
      cleanupDrops(currentTime);
      createDrop(currentTime);
    }

    previousTimeRef.current = currentTime;
    requestRef.current = requestAnimationFrame(animate);
  }, [cleanupDrops, createDrop]);

  // Setup and cleanup animation frame
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  return (
    <Box
      sx={{
        height: '100%',
        opacity: 0.3,
        overflow: 'hidden',
        position: 'absolute',
        width: '100%',
        zIndex: 0,
        ...style
      }}
    >
      {drops.map((drop) => (
        <Box
          component='img'
          key={drop.id}
          src={logoTransparent as string}
          sx={{
            animation: `drop ${DROP_SPEED}ms linear`,
            filter: 'blur(10px)',
            height: '85px',
            left: `${drop.x}%`,
            opacity: 0.7,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            width: '85px'
          }}
        />
      ))}
      <style>
        {`
          @keyframes drop {
            from {
              top: -50px;
            }
            to {
              top: ${ground}px;
            }
          }
        `}
      </style>
    </Box>
  );
}

export default React.memo(LogoDropAnimation);
