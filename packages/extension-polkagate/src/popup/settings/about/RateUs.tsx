// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { star } from '../icons';
import RateUsButton from '../partials/RateUsButton';

function RateUs (): React.ReactElement {
  return (
    <Grid alignItems='center' columnGap='5px' container item justifyContent='space-between' sx={{ border: '4px solid', borderColor: 'border.paper', borderRadius: '14px', mt: '5px', bgcolor: 'background.paper', height: '70px', px: '10px' }}>
      <Grid alignItems='center' container item sx={{ width: 'fit-content' }}>
        <Box
          sx={{
            position: 'relative',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 36,
              height: 36,
              background: 'linear-gradient(180deg, #FFCE4F 0%, #FFA929 100%)',
              borderRadius: '50%',
              filter: 'blur(8px)',
              opacity: 0.4,
              zIndex: 0
            }}
          />
          <Box
            component='img'
            src={star as string}
            sx={{
              width: '17.42px',
              position: 'relative',
              zIndex: 1
            }}
          />
        </Box>
        <Grid alignItems='baseline' columnGap='5px' container item width='fit-content'>
          <Typography color='text.primary' sx={{ fontFamily: 'Inter', fontSize: '19px', fontWeight: 600, letterSpacing: '-1px' }}>
            4.6
          </Typography>
          <Typography color='#AA83DC' variant='B-4'>
            (26 reviewers)
          </Typography>
        </Grid>
      </Grid>
      <RateUsButton />
    </Grid>
  );
}

export default React.memo(RateUs);
