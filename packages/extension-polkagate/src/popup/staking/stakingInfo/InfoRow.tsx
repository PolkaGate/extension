// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import React from 'react';

interface Props {
  Icon: Icon;
  text1: string;
  text2: string;
  text3: string;
}

function InfoRow ({ Icon, text1, text2, text3 }: Props): React.ReactElement {
  return (
    <Stack alignItems='center' columnGap='10px' direction='row' my='10px'>
      <Stack
        alignItems='center' justifyContent='center' sx={{
          width: 48,
          height: 48,
          borderRadius: '16px',
          overflow: 'hidden',
          transform: 'rotate(-12deg)',
          backgroundImage: 'linear-gradient(180deg, #674394 0%, #4B2A75 50%, #171739 100%)'
        }}
        width='70px'
      >
        <Icon
          color='#AA83DC'
          size={32}
          style={{ transform: 'rotate(-12deg)' }}
          variant='Bulk'
        />
      </Stack>
      <Stack sx={{ flexFlow: 'wrap' }} width='290px'>
        <Typography color='#BEAAD8' textAlign='left' variant='B-3'>
          {text1}
          <Typography color='#AA83DC' variant='B-3'>
            {text2}
          </Typography>
          {' '}{text3}
        </Typography>

      </Stack>
    </Stack>
  );
}

export default InfoRow;
