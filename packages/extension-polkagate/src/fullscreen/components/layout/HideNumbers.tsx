// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import { Eye, EyeSlash } from 'iconsax-react';
import React from 'react';

import { useIsDark, useIsHideNumbers } from '../../../hooks';

function HideNumbers(): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const hoverBg = isDark ? '#674394' : '#F3F6FD';
  const eyeColor = theme.palette.accent.icon;

  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  return (
    <Grid
      alignItems='center' container item justifyContent='center' onClick={toggleHideNumbers}
      sx={{
        ':hover': { background: hoverBg },
        alignItems: 'center',
        backdropFilter: 'blur(20px)',
        background: isDark ? '#2D1E4A80' : '#FFFFFF',
        border: isDark ? 'none' : '1px solid #DDE3F4',
        borderRadius: '12px',
        boxShadow: isDark ? '0px 0px 24px 8px #4E2B7259 inset' : '0px 8px 22px rgba(133, 140, 176, 0.12)',
        cursor: 'pointer',
        height: '32px',
        transition: 'all 250ms ease-out',
        width: '32px'
      }}
    >
      {isHideNumbers
        ? <EyeSlash color={eyeColor} size='20' variant='Bulk' />
        : <Eye color={eyeColor} size='20' variant='Bulk' />}
    </Grid>
  );
}

export default React.memo(HideNumbers);
