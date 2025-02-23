// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../../../hooks';
import { Discord, Docs, Email, Github, Web, XIcon, YoutubeIcon } from '../icons';
import SocialIcon from './SocialIcon';

export default function Socials ({ short }: { short?: boolean }): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();

  const bgColor = short && !isDark ? '#CCD2EA' : undefined;

  return (
    <>
      <Typography
        color= 'label.secondary'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: short ? 'left' : 'center' }}
        variant='H-4'
      >
        STAY TUNED
      </Typography>
      <Grid columnGap='8px' container justifyContent={short ? 'flex-start' : 'center'}>
        <SocialIcon Icon={<YoutubeIcon color= {theme.palette.icon.secondary} width= '18px' />} bgColor= { bgColor } link='https://www.youtube.com/@polkagate' />
        <SocialIcon Icon={<XIcon color= {theme.palette.icon.secondary} width= '18px' />} bgColor= { bgColor } link='https://x.com/polkagate' />
        <SocialIcon Icon={<Discord color= {theme.palette.icon.secondary} width= '18px' />} bgColor= { bgColor } link='https://discord.gg/gsUrreJh' />
        <SocialIcon Icon={<Github color= {theme.palette.icon.secondary} width= '18px' />} bgColor= { bgColor } link='https://github.com/PolkaGate/' />
        {!short && <>
          <SocialIcon Icon={<Email color= {theme.palette.icon.secondary} width= '18px' />} link='mailto:support@polkagate.xyz' />
          <SocialIcon Icon={<Docs color= {theme.palette.icon.secondary} width= '18px' />} link='https://docs.polkagate.xyz/' />
          <SocialIcon Icon={<Web color= {theme.palette.icon.secondary} width= '18px' />} link='https://polkagate.xyz/' />
        </>
        }
      </Grid>
    </>
  );
}
