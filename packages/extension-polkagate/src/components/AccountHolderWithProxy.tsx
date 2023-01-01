// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import ThroughProxy from '../partials/ThroughProxy';
import { AccountHolder } from '.';

interface Props {
  address: string;
  showDivider?: boolean;
  style?: SxProps<Theme> | undefined;
  selectedProxyAddress?: string;
  title?: string;
  chain: Chain | null;
}

function AccountHolderWithProxy({ address, chain, selectedProxyAddress, showDivider = false, style, title }: Props): React.ReactElement {
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
          chain={chain}
          style={{ pb: '5px', pt: '10px' }}
        />
      }
      {showDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      }
    </Grid>
  );
}

export default React.memo(AccountHolderWithProxy);
