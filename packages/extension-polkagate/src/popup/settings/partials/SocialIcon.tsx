// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { useIsDark } from '../../../hooks/index';

interface Props {
  Icon: React.JSX.Element;
  bgColor?: string;
  link: string;
}

function SocialIcon ({ Icon, bgColor, link }: Props): React.ReactElement {
  const goToLink = useCallback(() => window.open(link, '_blank'), [link]);
  const isDark = useIsDark();

  return (
    <Grid
      bgcolor={bgColor || (isDark ? '#2D1E4A' : '#FFFFFF')}
      onClick={goToLink}
      sx={{
        '&:hover': {
          bgcolor: '#CC429D'
        },
        alignItems: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        height: 32,
        justifyContent: 'center',
        width: 32
      }}
    >
      {Icon }
    </Grid>

  );
}

export default (SocialIcon);
