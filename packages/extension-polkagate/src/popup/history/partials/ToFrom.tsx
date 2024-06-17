// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { Divider, Grid } from '@mui/material';
import React from 'react';

import { CopyAddressButton } from '../../../components';

export default function ToFrom({ item, mt = 0, noDivider = false, toCopy }: { item: string | undefined | any, mt?: number, noDivider?: boolean, toCopy?: string }) {
  return (
    <>
      {item &&
        <>
          <Grid alignItems='center' container justifyContent='center'>
            {item}
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

