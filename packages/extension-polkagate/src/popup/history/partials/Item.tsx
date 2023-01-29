// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { CopyAddressButton } from '../../../components';

export default function Item({ item, mt = 0, noDivider = false, toCopy }: { item: string | undefined, mt?: number, noDivider?: boolean, toCopy?: string }) {
  return (
    <>
      {item &&
        <>
          <Grid alignItems='center' container justifyContent='center'>
            <Grid item>
              <Typography fontSize='16px' fontWeight={400} sx={{ mt: `${mt}px` }}>
                {item}
              </Typography>
            </Grid>
            <Grid item>
              {toCopy &&
                <CopyAddressButton
                  address={toCopy}
                  size={18}
                />}
            </Grid>
          </Grid>
          {!noDivider &&
            <Divider sx={{ bgcolor: 'secondary.light', height: '2px', m: '3px auto', width: '75%' }} />
          }
        </>
      }
    </>
  );
}

