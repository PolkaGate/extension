// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { useIsBlueish, useIsDark } from '../../../hooks/index';

interface Props {
  Icon: React.JSX.Element;
  bgColor?: string;
  link: string;
  size?: number;
}

function SocialIcon ({ Icon, bgColor, link, size = 32 }: Props): React.ReactElement {
  const isDark = useIsDark();
  const isBlueish = useIsBlueish();

  const goToLink = useCallback(() => window.open(link, '_blank', 'noopener,noreferrer'), [link]);

  return (
    <Grid
      bgcolor={bgColor || (isDark ? isBlueish ? '#809ACB33' : '#2D1E4A' : '#FFFFFF')}
      onClick={goToLink}
      sx={{
        '&:hover': {
          bgcolor: '#CC429D'
        },
        alignItems: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        height: size,
        justifyContent: 'center',
        width: size
      }}
    >
      {Icon}
    </Grid>

  );
}

export default (SocialIcon);
