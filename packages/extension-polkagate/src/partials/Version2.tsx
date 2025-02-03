// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import Sparkles from '../components/SVG/Sparkles';
import { useManifest, useTranslation } from '../hooks';
import { GradientBorder } from '../style';

export default function Version (): React.ReactElement {
  const { t } = useTranslation();
  const version = useManifest()?.version;

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ columnGap: '5px', py: '24px' }}>
      <Typography color='#BEAAD880' variant='B-1'>
        {t('Version')}
      </Typography>
      <Typography color='#BEAAD880' variant='B-1'>
        {version}
      </Typography>
      <GradientBorder style={{ height: '1px', opacity: 0.5, position: 'static', rotate: '90deg', width: '14px' }} />
      <Sparkles color={hovered ? '#AA83DC' : '#FF4FB9'} height={12} width={12} />
      <Typography color={hovered ? '#AA83DC' : '#BEAAD8'} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} sx={{ cursor: 'pointer', textDecoration: hovered ? 'underline' : 'none' }} variant='B-1'>
        {t('What’s new page')}
      </Typography>
    </Grid>
  );
}
