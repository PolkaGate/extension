// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { FormatBalance2 } from '../../../components';

export default function Amount({ amount, decimal, label, token }: { label: string, amount: string, decimal: number, token: string }) {
  return (
    <Grid container fontSize='16px' fontWeight={400} item justifyContent='center' spacing={1}>
      <Grid item>
        {label}
      </Grid>
      <Grid item>
        <FormatBalance2
          decimals={[Number(decimal)]}
          tokens={[token]}
          value={new BN(amount)}
        />
      </Grid>
    </Grid>
  );
}
