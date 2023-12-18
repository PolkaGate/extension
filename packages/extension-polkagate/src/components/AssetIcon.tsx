// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid } from '@mui/material';
import React from 'react';

interface Props {
  asset: string;
  logo: string;
  assetHeight?: string;
  assetWidth?: string;
  logoHeight?: string;
  logoWidth?: string;
}

export default function AssetIcon({ asset, assetHeight = '40px', assetWidth = '40px', logo, logoHeight = '20px', logoWidth = '20px' }: Props): React.ReactElement {
  return (
    <Grid container sx={{ position: 'relative', width: 'fit-content' }}>
      <Avatar
        src={asset}
        sx={{ borderRadius: '50%', height: assetHeight, width: assetWidth }}
        variant='square'
      />
      <Avatar
        src={logo}
        sx={{ bgcolor: 'white', borderRadius: '50%', height: logoHeight, inset: 'auto -5px -5px auto', p: '1.5px', position: 'absolute', width: logoWidth }}
        variant='square'
      />
    </Grid>
  );
}
