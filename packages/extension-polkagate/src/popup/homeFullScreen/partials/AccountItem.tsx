// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Backdrop, Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { useAccountAssets, useApi, useChain, useFormatted } from '../../../hooks';
import QuickActionFullScreen from '../../../partials/QuickActionFullScreen';
import AccountInformation from '../partials/AccountInformation';

interface Props {
  account: AccountWithChildren;
  hideNumbers: boolean | undefined;
  quickActionOpen: string | boolean | undefined;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
}

function AccountItem({ account, hideNumbers, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement {
  const api = useApi(account.address);
  const theme = useTheme();
  const chain = useChain(account.address);
  const formatted = useFormatted(account.address);
  const accountAssets = useAccountAssets(account.address);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [assetId, setAssetId] = useState<number | undefined>();

  const handleClose = useCallback(() => setQuickActionOpen(undefined), [setQuickActionOpen]);


  return (
    <Grid container item ref={containerRef} sx={{ overflow: 'hidden', position: 'relative' }} width='760px'>
      <AccountInformation
        accountAssets={accountAssets}
        address={account.address}
        api={api}
        assetId={assetId}
        balances={undefined}
        chain={chain}
        chainName={chain?.name}
        formatted={formatted}
        hideNumbers={hideNumbers}
        setAssetId={setAssetId}
      />
      <Backdrop
        onClick={handleClose}
        open={quickActionOpen !== undefined}
        sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(23, 23, 23, 0.8)' : 'rgba(241, 241, 241, 0.7)', borderRadius: '5px', bottom: '-1px', left: '-1px', position: 'absolute', right: '-1px', top: '-1px' }}
      />
      <QuickActionFullScreen address={account.address} containerRef={containerRef} quickActionOpen={quickActionOpen} setQuickActionOpen={setQuickActionOpen} />
    </Grid>
  );
}

export default React.memo(AccountItem);
