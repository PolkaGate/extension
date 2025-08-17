// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid } from '@mui/material';
import { keyframes } from '@mui/system';
import React, { useEffect, useState } from 'react';

import { Item1 } from '../assets/img';

const INTERVAL = 30000;
const DISPLAYED_ITEM_COLOR = '#AA83DC';
const UNDISPLAYED_ITEM_COLOR = 'rgba(190, 170, 216, 0.25)';

const fillAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 40px;
  }
`;

const carouselItems = [
  Item1,
  Item1,
  Item1,
  Item1,
  Item1
];

function Carousel () {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleIndicatorClick = (index: number) => () => {
    setCurrentIndex(index);
  };

  // Auto Slide every INTERVAL seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ pb: '15px', position: 'relative', width: '100%' }}>
      {/* Indicators */}
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: 2
        }}
      >
        {carouselItems.map((_, index) => (
          <Box
            key={index}
            onClick={handleIndicatorClick(index)}
            sx={{
              backgroundColor: index >= currentIndex ? UNDISPLAYED_ITEM_COLOR : DISPLAYED_ITEM_COLOR,
              borderRadius: '2px',
              cursor: 'pointer',
              height: '4px',
              overflow: 'hidden',
              position: 'relative',
              ...(index === currentIndex && { width: '100px' }), // Indicator fills for active slide
              width: '60px'
            }}
          >
            {index === currentIndex && (
              <Box
                sx={{
                  animation: `${fillAnimation} ${INTERVAL}ms linear`,
                  backgroundColor: DISPLAYED_ITEM_COLOR,
                  height: '4px',
                  left: 0,
                  position: 'absolute',
                  top: 0,
                  width: '40px'
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      {/* Carousel Container */}
      <Grid
        container
        sx={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 500ms ease-in-out',
          width: '100%'
        }}
        wrap='nowrap'
      >
        {carouselItems.map((item, index) => (
          <Box
            component='img'
            key={index}
            src={item as string}
            sx={{
              flex: '0 0 100%', // Slide occupies 100% of the container's width
              height: 'auto',
              maxHeight: '155px',
              objectFit: 'contain',
              width: '100%'
            }}
          />
        ))}
      </Grid>
    </Box>
  );
}

export default React.memo(Carousel);
