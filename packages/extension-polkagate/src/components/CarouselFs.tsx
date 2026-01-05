// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Box, Grid, Typography } from '@mui/material';
import { keyframes, Stack } from '@mui/system';
import { ArrowCircleRight2, Home3, Triangle, UserOctagon } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { welcomeScreen1, welcomeScreen2, welcomeScreen3, welcomeScreen4 } from '../assets/img';
import { useTranslation } from './translate';

const INTERVAL = 4000;
const DISPLAYING_ITEM_COLOR = '#EAEBF1';
const UNDERPLAYING_ITEM_COLOR = '#EAEBF180';

const fillAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

const carouselItems = [
  welcomeScreen1,
  welcomeScreen2,
  welcomeScreen3,
  welcomeScreen4
];

function Indicators ({ currentIndex, onClick }: { currentIndex: number, onClick: (index: number) => void }) {
  const SELECTED_SIZE = 12;
  const hiddenIndicators = [8, 6, 4];
  const indicatorsDimensions = [
    ...hiddenIndicators.slice(0, currentIndex),
    SELECTED_SIZE,
    ...hiddenIndicators.slice(currentIndex)
  ];

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', gap: '4px', justifyContent: 'center', position: 'absolute', right: '15px', top: '20px', zIndex: 100 }}>
      {carouselItems.map((_, index) => (
        <Box
          key={index}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => onClick(index)}
          sx={{
            backgroundColor: index === currentIndex ? DISPLAYING_ITEM_COLOR : UNDERPLAYING_ITEM_COLOR,
            borderRadius: '50%',
            cursor: 'pointer',
            height: `${indicatorsDimensions[index]}px`,
            overflow: 'hidden',
            position: 'relative',
            ...(index === currentIndex && { width: '100px' }), // Indicator fills for active slide
            width: `${indicatorsDimensions[index]}px`
          }}
        >
          {index === currentIndex && (
            <Box
              sx={{
                animation: `${fillAnimation} ${INTERVAL}ms linear`,
                backgroundColor: DISPLAYING_ITEM_COLOR,
                borderRadius: '50%',
                height: `${SELECTED_SIZE}px`,
                left: 0,
                position: 'absolute',
                top: 0,
                width: `${SELECTED_SIZE}px`
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}

function Slides ({ currentIndex }: { currentIndex: number }) {
  return (
    <Grid container sx={{ height: '100%', position: 'relative', width: '100%' }}>
      {carouselItems.map((item, index) => (
        <Box
          component='img'
          key={index}
          src={item as string}
          sx={{
            height: 'auto',
            left: 0,
            maxHeight: '693px',
            objectFit: 'contain',
            opacity: index === currentIndex ? 1 : 0,
            position: 'absolute',
            top: 0,
            width: '100%',
            transform: index === currentIndex
              ? 'translateX(0)'
              : index < currentIndex
                ? 'translateX(-10%)'
                : 'translateX(10%)',
            transition: 'opacity 600ms ease, transform 600ms ease'
          }}
        />
      ))}
    </Grid>
  );
}

function Subtitles ({ index, subTitles }: { index: number, subTitles: { Icon: Icon; title: string; }[] }) {
  const Icon = subTitles[index].Icon;

  return (
    <Stack direction='column' rowGap='20px' sx={{ bottom: '22px', left: '30px', position: 'absolute', width: '48%', zIndex: 100 }}>
      <Icon color='#EAEBF1' size={32} variant='Bold' />
      <Typography color='#FFFFFF' display='block' lineHeight='115%' textAlign='left' textTransform='uppercase' variant='H-2'>
        {subTitles[index].title}
      </Typography>
    </Stack>
  );
}

function Carousel () {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const subTitles = [
    {
      Icon: Home3,
      title: t('We appreciate your choice in selecting PolkaGate')
    },
    {
      Icon: ArrowCircleRight2,
      title: t('Easily send and receive funds securely across chains')
    },
    {
      Icon: UserOctagon,
      title: t('Stake your tokens and earn rewards effortlessly')
    },
    {
      Icon: Triangle,
      title: t('Explore, collect, and enjoy all your NFT details')
    }
  ];
  const handleIndicatorClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <Grid
      container item sx={{
        borderRadius: '24px',
        // height: 'calc(100% - 68px)',
        height: '693px',
        m: '5px',
        minHeight: '693px',
        overflow: 'hidden',
        position: 'relative',
        width: '582px'
      }}
    >
      <Indicators
        currentIndex={currentIndex}
        onClick={handleIndicatorClick}
      />
      <Slides
        currentIndex={currentIndex}
      />
      <Subtitles
        index={currentIndex}
        subTitles={subTitles}
      />
    </Grid>
  );
}

export default React.memo(Carousel);
