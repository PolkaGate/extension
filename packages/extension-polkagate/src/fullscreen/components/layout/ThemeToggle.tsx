// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { Moon, Sun1 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { ColorContext } from '@polkadot/extension-polkagate/src/components';

import { useIsDark } from '../../../hooks';

export default function ThemeToggle(): React.ReactElement {
  const isDark = useIsDark();
  const colorMode = useContext(ColorContext);

  const onClick = useCallback(() => {
    colorMode.toggleColorMode();
  }, [colorMode]);

  const Icon = isDark ? Moon : Sun1;

  return (
    <Box onClick={onClick} sx={{ alignItems: 'center', borderRadius: '16px', cursor: 'pointer', display: 'flex', height: '32px', position: 'relative', width: '48px' }}>
      <Box sx={{ backdropFilter: 'blur(8px)', bgcolor: isDark ? '#2D1E4A80' : 'background.default', borderRadius: '16px', boxShadow: '0px 0px 24px 8px #4E2B7259 inset', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Box sx={{
        background: '#9542FF4D',
        borderRadius: '50%',
        height: 28,
        position: 'relative',
        transform: isDark ? 'translateX(0px)' : 'translateX(20px)',
        transition: 'transform 0.2s ease-in-out',
        width: 28
      }}>

        <Box
          sx={{
            alignItems: 'center',
            background: isDark ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#EAEBF1',
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
