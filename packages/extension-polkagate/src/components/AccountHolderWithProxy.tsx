// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import ThroughProxy from '../partials/ThroughProxy';
import { AccountHolder } from '.';

interface Props {
  address: string;
  showDivider?: boolean;
  style?: SxProps<Theme> | undefined;
  selectedProxyAddress?: string;
  title?: string;
}

function AccountHolderWithProxy({ address, selectedProxyAddress, showDivider = false, style, title }: Props): React.ReactElement {
  return (
    <Grid
      alignItems='center'
      container
      direction='column'
      justifyContent='center'
      sx={{
        fontWeight: 300,
        letterSpacing: '-0.015em',
        pt: '5px',
        ...style
      }}
    >
      <AccountHolder
        address={address}
        title={title}
      />
      {selectedProxyAddress &&
        <ThroughProxy
          address={selectedProxyAddress}
          style={{ pt: '10px', pb: '5px' }}
        />
      }
      {showDivider &&
        <Divider
          sx={{
            bgcolor: 'secondary.main',
            height: '2px',
            mt: '5px',
            width: '240px'
          }}
        />
      }
    </Grid>
  );
}

export default React.memo(AccountHolderWithProxy);
