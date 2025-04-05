// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useState } from 'react';

const IllustrateSeed = ({ seed, style }: { style?: SxProps<Theme>, seed: null | string }) => {
  const wordsArray = seed?.split(' ');
  const [isHovered, setIsHovered] = useState<number | undefined>();

  return (
    <Grid container item sx={style}>
      {wordsArray?.map((word, index) => (
        <Stack
          alignItems='center'
          direction='row'
          key={word} onMouseEnter={() => setIsHovered(index)} onMouseLeave={() => setIsHovered(undefined)}
          sx={{
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            },
            animation: `fadeIn 0.5s ease-in-out ${index * 0.4}s forwards`,
            background: isHovered === index ? '#2D1E4A' : '#2D1E4A8C',
            borderRadius: '18px',
            margin: '5px',
            minWidth: '100px',
            opacity: 0,
            padding: '1px',
            transform: 'translateY(-10px)',
            width: 'fit-content'
          }}
        >
          <Box
            alignContent='center' justifyItems='center' sx={{
              bgcolor: isHovered === index ? '#674394' : '#2D1E4A',
              borderRadius: '14px',
              height: '36px',
              m: '2px',
              width: '31px'
            }}
          >
            <Typography alignSelf='center' color='#BEAAD8'>
              {index + 1}
            </Typography>
          </Box>
          <Typography color='#BEAAD8' sx={{ px: '10px' }} variant='B-2'>
            {word}
          </Typography>
        </Stack>
      ))
      }
    </Grid>
  );
};

export default React.memo(IllustrateSeed);
