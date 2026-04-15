// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import { MySkeleton } from '@polkadot/extension-polkagate/src/components';

import { useIsDark } from '../../../hooks/index';
import { PolkaGateTransparentLogo } from '../../components';
import { COLUMN_WIDTH } from '../consts';

function HistoryRow(): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Grid alignItems='center' container item justifyContent='start' sx={{ background: isDark ? '#05091C' : '#EDF1FF', borderRadius: '14px', columnGap: '30px', p: '10px', transition: 'all 250ms ease-out' }} xs>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: COLUMN_WIDTH.ACTION }}>
        <PolkaGateTransparentLogo />
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

export default HistoryRow;
