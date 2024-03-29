// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid } from '@mui/material';
import React from 'react';

interface Props {
  asset: string;
  baseLogo: string;
  assetSize?: string;
  baseLogoSize?: string;
}

export default function AssetIcon ({ asset, assetSize = '40px', baseLogo, baseLogoSize = '20px' }: Props): React.ReactElement {
  return (
    <Grid container sx={{ position: 'relative', width: 'fit-content' }}>
      <Avatar
        src={asset}
        sx={{ borderRadius: '50%', height: assetSize, width: assetSize }}
        variant='square'
      />
      <Avatar
        src={baseLogo}
        sx={{ '> img': { borderRadius: '50%' }, bgcolor: 'white', borderRadius: '50%', height: baseLogoSize, inset: 'auto -5px -5px auto', p: '1.5px', position: 'absolute', width: baseLogoSize }}
        variant='square'
      />
    </Grid>
  );
}
