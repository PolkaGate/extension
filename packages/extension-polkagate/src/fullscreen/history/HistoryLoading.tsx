// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid } from '@mui/material';
import React from 'react';

import { MySkeleton } from '@polkadot/extension-polkagate/src/components';

import { logoWhiteTransparent } from '../../assets/logos';
import { useIsDark } from '../../hooks/index';
import { COLUMN_WIDTH } from './consts';


function Loading (): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Grid alignItems='center' container item justifyContent='start' sx={{ background: isDark ? '#05091C' : '#EDF1FF', borderRadius: '14px', columnGap: '30px', p: '10px', transition: 'all 250ms ease-out' }} xs>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: COLUMN_WIDTH.ACTION }}>
        <Box
          component='img'
          src={logoWhiteTransparent as string}
          sx={{
            bgcolor: isDark ? '#292247' : '#CFD5F0',
            borderRadius: '999px',
            filter: isDark ? 'brightness(0.4)' : 'brightness(0.9)',
            height: '36px',
            p: '4px',
            width: '36px'
          }}
        />
        <MySkeleton
          bgcolor={isDark ? '#946CC826' : '#99A1C459'}
          width={50}
        />
      </Grid>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: COLUMN_WIDTH.SUB_ACTION }}>
        <MySkeleton
          bgcolor={isDark ? '#946CC826' : '#99A1C459'}
          width={100}
        />
      </Grid>
      <Grid alignItems='flex-end' container direction='column' item sx={{ rowGap: '6px', width: COLUMN_WIDTH.AMOUNT }}>
        <MySkeleton
          bgcolor={isDark ? '#B094D340' : '#99A1C440'}
          width={70}
        />
        <MySkeleton
          bgcolor={isDark ? '#946CC826' : '#99A1C459'}
          width={50}
        />
      </Grid>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', paddingLeft: '15px', width: COLUMN_WIDTH.DATE }}>
        <MySkeleton
          bgcolor={isDark ? '#946CC826' : '#99A1C459'}
          width={80}
        />
      </Grid>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: COLUMN_WIDTH.STATUS }}>
        <MySkeleton
          bgcolor={isDark ? '#946CC826' : '#99A1C459'}
          width={80}
        />
      </Grid>
    </Grid>
  );
}

function HistoryLoading ({ itemsCount = 4 }: { itemsCount?: number; }) {
  return (
    <div style={{ display: 'grid', position: 'relative', rowGap: '5px', zIndex: 1 }}>
      {Array.from({ length: itemsCount }).map((_, index) => (
        <Loading key={index} />
      ))}
    </div>
  );
}

export default HistoryLoading;
