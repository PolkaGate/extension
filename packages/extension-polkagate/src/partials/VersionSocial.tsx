// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Email as EmailIcon, Language as LanguageIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Box, Grid, Link } from '@mui/material';
import React from 'react';

import { riot } from '../assets/icons';
import { useManifest, useTranslation } from '../hooks';

interface Props {
  fontSize: string;
  iconSize?: number;
}

export const SocialLinks = ({ iconSize = 15 }: { iconSize: number }) => (
  <Grid container width='fit-content'>
    <Grid item>
      <Link href={'mailto:polkagate@outlook.com'}>
        <EmailIcon sx={{ color: '#1E5AEF', fontSize: iconSize }} />
      </Link>
    </Grid>
    <Grid item pl='5px'>
      <Link href='https://polkagate.xyz' rel='noreferrer' target='_blank'>
        <LanguageIcon sx={{ color: '#007CC4', fontSize: iconSize }} />
      </Link>
    </Grid>
    <Grid item pl='5px'>
      <Link href='https://twitter.com/@polkagate' rel='noreferrer' target='_blank'>
        <TwitterIcon sx={{ color: '#2AA9E0', fontSize: iconSize }} />
      </Link>
    </Grid>
    <Grid item pl='5px'>
      <Link href='https://matrix.to/#/#polkagate:matrix.org' rel='noreferrer' target='_blank'>
        <Box component='img' src={riot} sx={{ height: iconSize === 15 ? '12px' : '17px', width: iconSize === 15 ? '12px' : '17px', mt: '2px' }} />
      </Link>
    </Grid>
  </Grid>
);

function VersionSocial ({ fontSize, iconSize = 15 }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const manifest = useManifest();

  return (
    <Grid container fontSize={fontSize} justifyContent='space-between' sx={{ bottom: '10px', pl: '10px', position: 'absolute', width: '85%' }}>
      <Grid item>
        {`${t('Version')} ${manifest?.version || ''}`}
      </Grid>
      <SocialLinks iconSize={iconSize} />
    </Grid>
  );
}

export default React.memo(VersionSocial);
