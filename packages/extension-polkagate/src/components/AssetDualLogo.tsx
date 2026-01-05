// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, useTheme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../hooks';
import { TOKENS_WITH_BLACK_LOGO } from '../util/constants';

interface Props {
  asset: string;
  baseLogo: string;
  assetSize?: string;
  baseLogoSize?: string;
  baseLogoPosition?: string;
  logoRoundness?: string;
  style?: React.CSSProperties | undefined;
  token?: string | undefined;
}

export default function AssetDualLogo ({ asset, assetSize = '40px', baseLogo, baseLogoPosition, baseLogoSize = '20px', logoRoundness = '50%', style = {}, token }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const filter = isDark
    ? TOKENS_WITH_BLACK_LOGO.includes(token ?? '')
      ? 'invert(1)'
      : ''
    : '';

  return (
    <Grid container sx={{ position: 'relative', width: 'fit-content', ...style }}>
      <Avatar
        src={asset}
        sx={{ borderRadius: logoRoundness, filter, height: assetSize, width: assetSize }}
        variant='square'
      />
      <Avatar
        src={baseLogo}
        sx={{ '> img': { borderRadius: logoRoundness }, bgcolor: theme.palette.mode === 'light' ? '#fff' : '#000', borderRadius: '50%', height: baseLogoSize, inset: baseLogoPosition ?? 'auto -5px -5px auto', p: '1px', position: 'absolute', width: baseLogoSize }}
        variant='square'
      />
    </Grid>
  );
}
