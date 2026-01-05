// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import { Moon, Sun1 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { noop } from '@polkadot/util';

import useIsDark from '../../../../hooks/useIsDark';

export default function ThemeChange(): React.ReactElement {
  const isDark = useIsDark();

  //const colorMode = useContext(ColorContext);
  const toggleTheme = useCallback(() => {
    // colorMode.toggleColorMode()
    noop();
  }, []);

  return (
    <Grid alignItems='center' container item justifyContent='space-around' justifyItems='center' onClick={toggleTheme} sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '16px', cursor: 'pointer', height: '39px', mt: '2px', position: 'relative', width: '97px', zIndex: 10 }}>
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
