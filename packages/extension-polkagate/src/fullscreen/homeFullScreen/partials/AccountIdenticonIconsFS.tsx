// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import { Identicon } from '../../../components';
import { useIdentity, useInfo } from '../../../hooks';
import AccountIconsFs from '../../accountDetails/components/AccountIconsFs';

interface Props {
  address: string | undefined;
}

function AccountIdenticonIconsFS({ address }: Props): React.ReactElement {
  const { chain, formatted, genesisHash } = useInfo(address);

  const accountInfo = useIdentity(genesisHash, formatted);

  return (
    <Grid container item sx={{ borderRight: '1px solid', borderRightColor: 'divider', pr: '8px', width: 'fit-content' }}>
      <Grid container item pr='7px' sx={{ '> div': { height: 'fit-content' }, m: 'auto', width: 'fit-content' }}>
        <Identicon
          iconTheme={chain?.icon ?? 'polkadot'}
          prefix={chain?.ss58Format ?? 42}
          size={55}
          value={formatted || address}
        />
      </Grid>
      <AccountIconsFs
        accountInfo={accountInfo}
        address={address}
      />
    </Grid>
  );
}

export default React.memo(AccountIdenticonIconsFS);
