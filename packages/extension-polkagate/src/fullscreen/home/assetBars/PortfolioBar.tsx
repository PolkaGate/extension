// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetsWithUiAndPrice } from './types';

import { Box, Stack, useTheme } from '@mui/material';
import React from 'react';

function PortfolioBar({ assets }: { assets: AssetsWithUiAndPrice[] }): React.ReactElement {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack direction='row' justifyContent='space-between' sx={{ bgcolor: isDark ? '#1B133C' : '#E8ECF8', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '14px', height: '36px', ml: '8px' }}>
      <Stack alignItems='center' direction='row' justifyContent='center' sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', borderRadius: '10px', m: '4px', width: '100%' }}>
        <Stack direction='row' sx={{ borderRadius: 12, height: 11, overflow: 'hidden', width: '98%' }}>
          {assets.map((asset, index) => (
            <Box
              key={`${asset.priceId}_${index}`}
              sx={{
                bgcolor: asset.ui.color,
                height: '100%',
                width: `${asset.percent}%`
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(PortfolioBar);
