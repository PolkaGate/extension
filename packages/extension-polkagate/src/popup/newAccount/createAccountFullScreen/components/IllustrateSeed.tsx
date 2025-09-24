// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useState } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';

const IllustrateSeed = ({ seed, style }: { style?: SxProps<Theme>, seed: null | string }) => {
  const { t } = useTranslation();
  const wordsArray = seed?.split(' ');
  const [isHovered, setIsHovered] = useState<number | undefined>();
  const [revealed, setRevealed] = useState<boolean>(false);

  return (
    <Box position='relative' sx={style}>
      <Grid container item>
        {wordsArray?.map((word, index) => (
          <Stack
            alignItems='center'
            direction='row'
            key={word}
            onMouseEnter={() => setIsHovered(index)}
            onMouseLeave={() => setIsHovered(undefined)}
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
              alignContent='center'
              justifyItems='center'
              sx={{
                bgcolor: isHovered === index ? 'label.primary' : '#2D1E4A',
                borderRadius: '14px',
                height: '36px',
                m: '2px',
                width: '31px'
              }}
            >
              <Typography alignSelf='center' color='text.secondary'>
                {index + 1}
              </Typography>
            </Box>
            <Typography color='text.secondary' sx={{ px: '10px' }} variant='B-2'>
              {word}
            </Typography>
          </Stack>
        ))}
      </Grid>
      {!revealed && (
        <Box
          onClick={() => setRevealed(true)}
          sx={{
            alignItems: 'center',
            animation: 'fadeIn 0.5s',
            backdropFilter: 'blur(6px)',
            bgcolor: 'rgba(20, 15, 30, 0.4)',
            borderRadius: '14px',
            boxShadow: 'inset 0 0 0 1000px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex: 10
          }}
        >
          <Typography color='primary.main' sx={{ mb: 2 }} variant='B-2'>
            {t('Click to reveal — make sure no one is watching!')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(IllustrateSeed);
