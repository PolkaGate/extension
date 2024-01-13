// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Radio } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity } from '../../../../components';

export default function TAccountsDisplay ({ address, api, chain, selectedTrustedAddress }: { chain: Chain | null | undefined, address: string, api: ApiPromise, selectedTrustedAddress: string | undefined }): React.ReactElement {
  return (
    <Grid container justifyContent='space-between' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
      <Grid container maxWidth='380px' pl='8px' width='fit-content'>
        <Identity
          address={address}
          api={api}
          chain={chain}
          identiconSize={30}
          showShortAddress
          showSocial
        />
      </Grid>
      <Grid container maxWidth='50px' width='fit-content'>
        <Radio
          checked={!!(address === selectedTrustedAddress && selectedTrustedAddress)}
          sx={{
            '& .MuiSvgIcon-root': { fontSize: 28 },
            color: 'secondary.main'
          }}
          value={address}
        />
      </Grid>
    </Grid>
  );
}
