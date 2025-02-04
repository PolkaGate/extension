// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid } from '@mui/material';
import React, { useCallback } from 'react';

interface Props {
  icon: string;
  link: string;
}

function SocialIcon ({ icon, link }: Props): React.ReactElement {
  const goToLink = useCallback(() => () => window.open(link, '_blank'), [link]);

  return (
    <Grid
      bgcolor='#2D1E4A'
      onClick={goToLink()}
      sx={{
        alignItems: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        height: 32,
        justifyContent: 'center',
        width: 32
      }}
    >
      <Box
        component='img'
        src={icon}
        sx={{ width: '18px' }}
      />
    </Grid>

  );
}

export default (SocialIcon);
