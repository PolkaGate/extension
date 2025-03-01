// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';

import { Divider, Grid, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { useChain } from '../hooks';
import ThroughProxy from '../partials/ThroughProxy';
import { AccountHolder } from '.';

interface Props {
  address: string | undefined;
  showDivider?: boolean;
  style?: SxProps<Theme> | undefined;
  selectedProxyAddress?: string;
  title?: string;
  chain?: Chain | null | undefined;
  direction?: 'row' | 'column';
}

function AccountHolderWithProxy({ address, chain, direction = 'column', selectedProxyAddress, showDivider = false, style, title }: Props): React.ReactElement {
  const _chain = useChain(address);

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em', pt: '5px', ...style }}>
      <AccountHolder
        address={address}
        direction={direction}
        title={title}
      />
      {selectedProxyAddress &&
        <ThroughProxy
          address={selectedProxyAddress}
          chain={chain || _chain}
          showDivider
          style={{ pb: '5px' }}
        />
      }
      {showDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      }
    </Grid>
  );
}

export default React.memo(AccountHolderWithProxy);
