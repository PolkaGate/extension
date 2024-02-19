// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { useAccountAssets, useApi, useChain, useFormatted } from '../../../hooks';
import AccountInformation from '../partials/AccountInformation';

interface Props {
  account: AccountWithChildren;
}

function AccountItem ({ account }: Props): React.ReactElement {
  const api = useApi(account.address);
  const chain = useChain(account.address);
  const formatted = useFormatted(account.address);
  const accountAssets = useAccountAssets(account.address);

  const [assetId, setAssetId] = useState<number | undefined>();

  return (
    <Grid container item width='760px'>
      <AccountInformation
        accountAssets={accountAssets}
        address={account.address}
        api={api}
        assetId={assetId}
        balances={undefined}
        chain={chain}
        chainName={chain?.name}
        formatted={formatted}
        setAssetId={setAssetId}
      />
    </Grid>
  );
}

export default React.memo(AccountItem);
