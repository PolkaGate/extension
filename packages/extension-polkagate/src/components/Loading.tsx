// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, LinearProgress, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { logoBlack, logoWhite } from '../assets/logos';
import { useTranslation } from '../hooks';

interface Props {
  children?: React.ReactNode;
}

const MAX_WAITING_TIME = 400; //ms

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Simulate a 2-second loading delay
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, MAX_WAITING_TIME);

    const progressInterval = setInterval(() => {
      if (value < 100) {
        setValue(value + 1);
      }
    }, MAX_WAITING_TIME / 100);

    // Cleanup the timeout and interval when the component unmounts
    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(progressInterval);
    };
  }, [value]);

  const glowingLogoStyle = {
    opacity: value < 35 ? 0.5 : 1, // Adjust the opacity for the glowing effect
    transition: 'opacity 1s ease-in-out', // Transition for the glowing effect
  };

  if (isLoading || !children) {
    return (
      <Grid alignItems='center' container direction='column' justifyContent='center'>
        <Grid item sx={{ mt: '200px' }}>
          <Box
            component='img'
            src={theme.palette.mode === 'dark' ? logoWhite as string : logoBlack as string}
            sx={{ height: 75, width: 75, ...glowingLogoStyle }}
          />
        </Grid>
        <Grid sx={{ width: '80%' }}>
          <LinearProgress
            color='inherit'
            sx={{ color: theme.palette.text.primary, mt: '40px', height: '6px', borderRadius: '7px' }}
            value={value}
            variant='determinate'
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <>{children}</>
  );
}
