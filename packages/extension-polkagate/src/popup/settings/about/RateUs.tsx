// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';

import { star } from '../icons';
import RateUsButton from '../partials/RateUsButton';

const EXTENSION_RATE = 4.7;
const EXTENSION_REVIEWERS_COUNT = 30;

interface Props {
  style?: React.CSSProperties;
}

function RateUs({ style }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' columnGap='5px' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', border: '4px solid', borderColor: 'border.paper', borderRadius: '14px', height: '70px', mt: '5px', px: '10px', ...style }}>
      <Grid alignItems='center' container item sx={{ width: 'fit-content' }}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: 36,
            justifyContent: 'center',
            position: 'relative',
            width: 36
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(180deg, #FFCE4F 0%, #FFA929 100%)',
              borderRadius: '50%',
              filter: 'blur(8px)',
              height: 36,
              opacity: 0.4,
              position: 'absolute',
              width: 36,
              zIndex: 0
            }}
          />
          <Box
            component='img'
            src={star as string}
            sx={{
              position: 'relative',
              width: '17.42px',
              zIndex: 1
            }}
          />
        </Box>
        <Grid alignItems='baseline' columnGap='5px' container item width='fit-content'>
          <Typography color='text.primary' sx={{ fontFamily: 'Inter', fontSize: '19px', fontWeight: 600, letterSpacing: '-1px' }}>
            {EXTENSION_RATE}
          </Typography>
          <Typography color='#AA83DC' variant='B-4'>
            ({EXTENSION_REVIEWERS_COUNT} {t('reviewers')})
          </Typography>
        </Grid>
      </Grid>
      <RateUsButton />
    </Grid>
  );
}

export default React.memo(RateUs);
