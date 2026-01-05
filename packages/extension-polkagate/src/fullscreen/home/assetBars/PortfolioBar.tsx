// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetsWithUiAndPrice } from './types';

import { Box, Stack } from '@mui/material';
import React from 'react';

function PortfolioBar ({ assets }: { assets: AssetsWithUiAndPrice[] }): React.ReactElement {
  return (
    <Stack direction='row' justifyContent='space-between' sx={{ bgcolor: '#1B133C', borderRadius: '14px', height: '36px', ml: '8px' }}>
      <Stack alignItems='center' direction='row' justifyContent='center' sx={{ bgcolor: '#05091C', borderRadius: '10px', m: '4px', width: '100%' }}>
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
