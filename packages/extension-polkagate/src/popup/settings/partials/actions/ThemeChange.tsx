// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import { Moon, Sun1 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import ColorContext from '../../../../components/ColorContext';

export default function ThemeChange (): React.ReactElement {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const colorMode = useContext(ColorContext);
  const toggleTheme = useCallback(() => colorMode.toggleColorMode(), [colorMode]);

  return (
    <Grid alignItems='center' container item justifyContent='space-around' justifyItems='center' sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '14px', height: '39px', mt: '2px', position: 'relative', width: '97px', zIndex: 10 }}>
      <Moon color={isDark ? '#EAEBF1' : '#AA83DC'} cursor='pointer' onClick={toggleTheme} size={18} variant='Bold' />
      <Sun1 color={isDark ? '#AA83DC' : '#EAEBF1'} cursor='pointer' onClick={toggleTheme} size={18} variant='Bold' />
      <Grid alignItems='center' container item justifyContent='center' justifyItems='center'
        sx={{
          bgcolor: '#05091C',
          borderRadius: '16px',
          height: '33px',
          mt: '3px',
          position: 'absolute',
          top: 0,
          transform: isDark ? 'translateX(24px)' : 'translateX(-24px)',
          transition: 'transform 0.3s ease-in-out',
          width: '40px',
          zIndex: -1
        }}>
      </Grid>
    </Grid>

  );
}
