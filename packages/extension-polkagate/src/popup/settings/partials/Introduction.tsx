// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { logoTransparent } from '../../../assets/logos';
import { Version2 } from '../../../partials';
import { EXTENSION_NAME } from '../../../util/constants';

function Introduction (): React.ReactElement {
  return (
    <Grid alignItems='center' columnGap='5px' container item sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '46px', px: '10px' }}>
      <Box
        component='img'
        src={logoTransparent as string}
        sx={{ width: 36 }}
      />
      <Grid alignItems='baseline' columnGap='5px' container item width='fit-content'>
        <Typography color='text.primary' fontFamily='Eras' fontSize='18px' fontWeight={400}>
          {EXTENSION_NAME}
        </Typography>
        <Version2
          showLabel={false}
          style={{
            padding: 0,
            paddingLeft: '10px',
            width: 'fit-content'
          }}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(Introduction);
