// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { logoMotionDark, logoMotionLight } from '../assets/logos';

interface Props {
  children?: React.ReactNode;
}

const MAX_WAITING_TIME = 750; //ms

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const extensionViews = chrome.extension.getViews({ type: 'popup' });
  const isPopupOpenedByExtension = extensionViews.includes(window);

  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Simulate a loading delay
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

  return (
    <>{
      (isLoading && isPopupOpenedByExtension) || !children
        ? <Grid alignContent='center' alignItems='center' container sx={{ bgcolor: theme.palette.mode === 'dark' ? 'black' : 'white', height: '100%', pt: '190px', pb: '210px' }}>
          <Box
            component='img'
            src={theme.palette.mode === 'dark' ? logoMotionDark as string : logoMotionLight as string}
            sx={{ height: 'fit-content', width: '100%' }}
          />
        </Grid>
        : children
    }
    </>
  );
}
