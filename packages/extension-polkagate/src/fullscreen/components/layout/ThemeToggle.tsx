// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, useTheme } from '@mui/material';
import { Moon, Sun1 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { ColorContext } from '@polkadot/extension-polkagate/src/components';

import { useIsDark } from '../../../hooks';

export default function ThemeToggle(): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const colorMode = useContext(ColorContext);

  const onClick = useCallback(() => {
    colorMode.toggleColorMode();
  }, [colorMode]);

  const Icon = isDark ? Moon : Sun1;

  return (
    <Box onClick={onClick} sx={{ alignItems: 'center', borderRadius: '16px', cursor: 'pointer', display: 'flex', height: '32px', position: 'relative', width: '48px' }}>
      <Box
        sx={{
          backdropFilter: 'blur(8px)',
          bgcolor: isDark ? '#2D1E4A80' : '#D8CDEA',
          border: isDark ? 'none' : '1px solid #E9E2F5',
          borderRadius: '16px',
          bottom: 0,
          boxShadow: isDark ? '0px 0px 24px 8px #4E2B7259 inset' : '0 8px 22px rgba(116, 93, 139, 0.16)',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0
        }}
      />
      <Box sx={{
        background: isDark ? '#9542FF4D' : '#FFFFFF',
        borderRadius: '50%',
        boxShadow: isDark ? 'none' : '0 4px 12px rgba(116, 93, 139, 0.18)',
        height: 28,
        position: 'relative',
        transform: isDark ? 'translateX(0px)' : 'translateX(20px)',
        transition: 'transform 0.2s ease-in-out',
        width: 28
      }}
      >

        <Box
          sx={{
            alignItems: 'center',
            background: isDark ? theme.palette.gradient.brand : '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            height: 'stretch',
            justifyContent: 'center',
            margin: '2px',
            position: 'relative',
            width: 'auto'
          }}
        >
          <Icon color={isDark ? '#EAEBF1' : '#DC45A0'} size='16' variant='Bold' />
        </Box>
      </Box>
    </Box>
  );
}
