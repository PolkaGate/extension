// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useIsDark, useIsExtensionPopup } from '../../../hooks';
import { Docs, Email, Github, Telegram, Web, XIcon, YoutubeIcon } from '../icons';
import SocialIcon from './SocialIcon';

interface Props {
  buttonSize?: number;
  columnGap?: string;
  iconSize?: number;
  label?: string;
  short?: boolean;
  style?: SxProps;
}

export default function Socials ({ buttonSize, columnGap = '8px', iconSize = 18, label, short, style = {} }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();

  const bgColor = short && !isDark ? '#CCD2EA' : undefined;

  return (
    <Grid container direction='column' item sx={{ alignItems: 'center', ...style }}>
      {label &&
        <Typography
          color={isExtension ? 'label.secondary' : 'text.primary'}
          fontSize={!isExtension ? '22px' : undefined}
          my='8px'
          sx={{ display: 'block' }}
          variant='H-4'
        >
          {label}
        </Typography>
      }
      <Grid columnGap={columnGap} container item sx={{ flexWrap: 'nowrap', width: 'fit-content' }}>
        <SocialIcon Icon={<YoutubeIcon color={theme.palette.icon.secondary} width={`${iconSize}px`} />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={buttonSize} />
        <SocialIcon Icon={<XIcon color={theme.palette.icon.secondary} width={`${iconSize - 3}px`} />} bgColor={bgColor} link='https://x.com/polkagate' size={buttonSize} />
        <SocialIcon Icon={<Telegram color={theme.palette.icon.secondary} width={`${iconSize}px`} />} bgColor={bgColor} link='https://t.me/polkagate' size={buttonSize} />
        <SocialIcon Icon={<Github color={theme.palette.icon.secondary} width={`${iconSize}px`} />} bgColor={bgColor} link='https://github.com/PolkaGate/' size={buttonSize} />
        {!short &&
          <>
            <SocialIcon Icon={<Email color={theme.palette.icon.secondary} width={`${iconSize}px`} />} link='mailto:support@polkagate.xyz' size={buttonSize} />
            <SocialIcon Icon={<Docs color={theme.palette.icon.secondary} width={`${iconSize}px`} />} link='https://docs.polkagate.xyz/' size={buttonSize} />
            <SocialIcon Icon={<Web color={theme.palette.icon.secondary} width={`${iconSize}px`} />} link='https://polkagate.xyz/' size={buttonSize} />
          </>
        }
      </Grid>
    </Grid>
  );
}
