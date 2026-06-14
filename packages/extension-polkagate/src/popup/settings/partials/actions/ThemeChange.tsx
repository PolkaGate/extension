// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid,type SxProps, type Theme, useTheme } from '@mui/material';
import { Moon, Sun1 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { ColorContext } from '../../../../components';
import useIsDark from '../../../../hooks/useIsDark';

export default function ThemeChange({ style }:{style: SxProps<Theme>}): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const colorMode = useContext(ColorContext);

  const toggleTheme = useCallback(() => {
    colorMode.toggleColorMode();
  }, [colorMode]);

  return (
    <Grid alignItems='center' container item justifyContent='space-around' justifyItems='center' onClick={toggleTheme} sx={{ ...style, background: theme.palette.gradient.brand, position: 'relative', width: '97px', zIndex: 10 }}>
      <Moon color={isDark ? '#EAEBF1' : '#291443'} cursor='pointer' size={18} variant='Bold' />
      <Sun1 color={isDark ? '#AA83DC' : '#EAEBF1'} cursor='pointer' size={18} variant='Bold' />
      <Grid
        alignItems='center' container item justifyContent='center' justifyItems='center'
        sx={{
          bgcolor: isDark ? 'background.default' : '#FFFFFF',
          borderRadius: '16px',
          height: '33px',
          mt: '3px',
          position: 'absolute',
          top: 0,
          transform: isDark ? 'translateX(24px)' : 'translateX(-24px)',
          transition: 'transform 0.3s ease-in-out',
          width: '40px',
          zIndex: -1
        }}
      >
      </Grid>
    </Grid>

  );
}
