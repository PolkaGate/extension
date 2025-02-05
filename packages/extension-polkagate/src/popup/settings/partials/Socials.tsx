// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { discord, docs, email, github, web, x, youtube } from '../icons';
import SocialIcon from './SocialIcon';

export default function Socials ({ short }: { short?: boolean }): React.ReactElement {
  return (
    <>
      <Typography
        color='rgba(190, 170, 216, 1)'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: short ? 'left' : 'center' }}
        variant='H-4'>
        STAY TUNED
      </Typography>
      <Grid columnGap='8px' container justifyContent={short ? 'flex-start' : 'center'}>
        <SocialIcon icon={youtube as string} link='https://www.youtube.com/@polkagate' />
        <SocialIcon icon={x as string} link='https://x.com/polkagate' />
        <SocialIcon icon={discord as string} link='https://discord.gg/gsUrreJh' />
        <SocialIcon icon={github as string} link='https://github.com/PolkaGate/' />
        {!short && <>
          <SocialIcon icon={email as string} link='mailto:support@polkagate.xyz' />
          <SocialIcon icon={docs as string} link='https://docs.polkagate.xyz/' />
          <SocialIcon icon={web as string} link='https://polkagate.xyz/' />
        </>
        }
      </Grid>
    </>
  );
}
