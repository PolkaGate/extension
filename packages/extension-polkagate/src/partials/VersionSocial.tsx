// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Email as EmailIcon, Language as LanguageIcon, X as XIcon } from '@mui/icons-material';
import { Box, Grid, Link, useTheme } from '@mui/material';
import React from 'react';

import { riot } from '../assets/icons';
import { useManifest, useTranslation } from '../hooks';

interface Props {
  fontSize: string;
  iconSize?: number;
}

export const SocialLinks = ({ iconSize = 15 }: { iconSize?: number }) => {
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid alignItems='center' container width='fit-content'>
      <Link href={'mailto:polkagate@outlook.com'} pl='5px'>
        <EmailIcon sx={{ color: '#007CC4' , fontSize: iconSize }} />
      </Link>
      <Link href='https://polkagate.xyz' pl='5px' rel='noreferrer' target='_blank'>
        <LanguageIcon sx={{ color: 'success.main', fontSize: iconSize }} />
      </Link>
      <Link href='https://twitter.com/@polkagate' pl='5px' rel='noreferrer' target='_blank'>
        <XIcon sx={{ color: isDark ? 'white' : 'black', fontSize: iconSize - 2.5 }} />
      </Link>
      <Link href='https://matrix.to/#/#polkagate:matrix.org' pl='5px' rel='noreferrer' target='_blank'>
        <Box component='img' src={riot} sx={{ height: iconSize === 15 ? '12px' : '17px', width: iconSize === 15 ? '12px' : '17px', pt: '1px' }} />
      </Link>
    </Grid>
  );
};

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
