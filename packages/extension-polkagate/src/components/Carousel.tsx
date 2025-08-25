// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid } from '@mui/material';
import { keyframes } from '@mui/system';
import React, { useEffect, useState } from 'react';

import { welcomeExtension1, welcomeExtension2, welcomeExtension3, welcomeExtension4 } from '../assets/img';

const INTERVAL = 4000;
const DISPLAYED_ITEM_COLOR = '#AA83DC';
const UNDISPLAYED_ITEM_COLOR = 'rgba(190, 170, 216, 0.25)';

const fillAnimation = keyframes`
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
`;

const carouselItems: string[] = [
  welcomeExtension1 as string,
  welcomeExtension2 as string,
  welcomeExtension3 as string,
  welcomeExtension4 as string
];
const WIDE_ITEM_INDEX = 2;

function Indicators ({ currentIndex }: { currentIndex: number }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bottom: '8px',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '5px',
        height: '100%',
        justifyContent: 'flex-start',
        left: 1,
        paddingLeft: 1,
        position: 'absolute'
      }}
    >
      {[...carouselItems].reverse().map((_, index) => (
        <Box
          key={index}
          sx={{
            backgroundColor: index >= currentIndex ? UNDISPLAYED_ITEM_COLOR : DISPLAYED_ITEM_COLOR,
            borderRadius: '8px',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            width: '4px',
            ...(index === currentIndex && { height: '100px' }), // Indicator fills for active slide
            height: '20px'
          }}
        >
          {index === currentIndex && (
            <Box
              sx={{
                animation: `${fillAnimation} ${INTERVAL}ms linear`,
                backgroundColor: DISPLAYED_ITEM_COLOR,
                bottom: 0,
                height: '100%',
                left: 0,
                position: 'absolute',
                top: 'auto',
                transformOrigin: 'bottom',
                width: '100%'
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}

const BlurEffects = () => (
  <Grid container item justifyContent='center' sx={{ height: '265px', position: 'absolute', top: '0', width: '449px', zIndex: 2 }}>
    <Box sx={{ bgcolor: '#FF1AB1', borderRadius: '1820px', filter: 'blur(100px)', height: '128px', left: '30%', position: 'absolute', top: '-85px', width: '128px' }} />
    <Box sx={{ bgcolor: '#5B00B6', borderRadius: '1820px', filter: 'blur(100px)', height: '128px', position: 'absolute', right: '31px', top: '-6px', width: '128px' }} />
    <Box sx={{ bgcolor: '#5B00B6', borderRadius: '1820px', filter: 'blur(100px)', height: '128px', left: '-31px', position: 'absolute', top: '-6px', width: '128px' }} />
  </Grid>
);

function Slides ({ currentIndex }: { currentIndex: number }) {
  return (
    <Grid container item justifyContent='center' sx={{ height: '192px', overflow: 'hidden', position: 'relative', width: '100%', zIndex: 3 }}>
      {carouselItems.map((item, index) => (
        <Box
          component='img'
          key={index}
          src={item}
          sx={{
            height: 'auto',
            left: currentIndex === WIDE_ITEM_INDEX ? '70px' : undefined,
            objectFit: 'contain',
            opacity: index === currentIndex ? 1 : 0,
            position: 'absolute',
            top: 0,
            transform: index === currentIndex
              ? 'translateX(0)'
              : index < currentIndex
                ? 'translateX(-10%)'
                : 'translateX(10%)',
            transition: 'opacity 600ms ease, transform 600ms ease, width 600ms ease, left 600ms ease',
            width: currentIndex === WIDE_ITEM_INDEX ? '327px' : '222px'
          }}
        />
      ))}
    </Grid>
  );
}

function Carousel () {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <Grid container item sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
      <Indicators currentIndex={currentIndex} />
      <Slides currentIndex={currentIndex} />
      <BlurEffects />
    </Grid>
  );
}

export default React.memo(Carousel);
