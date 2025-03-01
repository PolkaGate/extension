// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Email as EmailIcon, GitHub as GitHubIcon, HelpCenter as HelpCenterIcon, Language as LanguageIcon, X as XIcon, YouTube as YouTubeIcon } from '@mui/icons-material';
import { Box, Grid, Link, useTheme } from '@mui/material';
import React from 'react';

import { riot } from '../assets/icons';
import { useIsExtensionPopup, useManifest, useTranslation } from '../hooks';

interface Props {
  fontSize: string;
  iconSize?: number;
}

const GRAY_COLOR = '#707070';

export const SocialLinks = ({ iconSize = 15 }: { iconSize?: number }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid alignItems='center' container width='fit-content'>
      <Link href={'mailto:polkagate@outlook.com'} pl='5px'>
        <EmailIcon
          sx={{
            '&:hover': {
              color: '#007CC4'
            },
            color: GRAY_COLOR,
            fontSize: iconSize
          }}
        />
      </Link>
      <Link href='https://polkagate.xyz' pl='5px' rel='noreferrer' target='_blank'>
        <LanguageIcon
          sx={{
            '&:hover': {
              color: theme.palette.success.main
            },
            color: GRAY_COLOR,
            fontSize: iconSize
          }}
        />
      </Link>
      <Link href='https://www.youtube.com/@polkagate' pl='5px' rel='noreferrer' target='_blank'>
        <YouTubeIcon
          sx={{
            '&:hover': {
              color: 'red'
            },
            color: GRAY_COLOR,
            fontSize: iconSize + 1
          }}
        />
      </Link>
      <Link href='https://twitter.com/@polkagate' pl='5px' rel='noreferrer' target='_blank'>
        <XIcon
          sx={{
            '&:hover': {
              color: isDark ? 'white' : 'black'
            },
            color: GRAY_COLOR,
            fontSize: iconSize - 2.5
          }}
        />
      </Link>
      <Link href='https://discord.gg/kf8msNm3' pl='5px' rel='noreferrer' sx={{ '&:hover': { '>svg': { color: '#5865F2' } }, '>svg': { color: '#' } }} target='_blank'>
        <FontAwesomeIcon
          color={GRAY_COLOR}
          icon={faDiscord}
          style={{
            height: iconSize === 15 ? '14px' : '17px',
            paddingBottom: '2px',
            width: iconSize === 15 ? '17px' : '20px'
          }}
        />
      </Link>
      <Link href='https://matrix.to/#/#polkagate:matrix.org' pl='5px' rel='noreferrer' target='_blank'>
        <Box
          component='img'
          src={riot as string}
          sx={{
            '&:hover': {
              filter: 'none'
            },
            filter: 'grayscale(100%)',
            height: iconSize === 15 ? '13px' : '17px',
            pt: '1px',
            width: iconSize === 15 ? '13px' : '17px'
          }}
        />
      </Link>
      <Link href='https://github.com/polkagate' pl='5px' rel='noreferrer' target='_blank'>
        <GitHubIcon
          sx={{
            '&:hover': {
              color: isDark ? 'white' : 'black'
            },
            color: GRAY_COLOR,
            fontSize: iconSize
          }}
        />
      </Link>
      <Link href='https://docs.polkagate.xyz/' pl='5px' rel='noreferrer' target='_blank'>
        <HelpCenterIcon
          sx={{
            '&:hover': {
              color: isDark ? 'white' : 'black'
            },
            color: GRAY_COLOR,
            fontSize: iconSize
          }}
        />
      </Link>
    </Grid>
  );
};

function VersionSocial({ fontSize, iconSize = 15 }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const manifest = useManifest();
  const isExtensionMode = useIsExtensionPopup();

  return (
    <Grid container fontSize={fontSize} justifyContent='space-between' sx={{ bottom: '10px', pl: '10px', position: 'absolute', width: isExtensionMode ? '92%' : '85%' }}>
      <Grid item>
        {`${t('Version')} ${manifest?.version || ''}`}
      </Grid>
      <SocialLinks iconSize={iconSize} />
    </Grid>
  );
}

export default React.memo(VersionSocial);
