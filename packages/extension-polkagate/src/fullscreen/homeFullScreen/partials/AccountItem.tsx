// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Backdrop, Grid, useTheme } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { AccountContext } from '../../../components';
import { useAccountAssets, useChain, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import QuickActionFullScreen from '../../../partials/QuickActionFullScreen';
import { label } from '../../../popup/home/AccountsTree';
import AccountInformationForHome from './AccountInformationForHome';

interface Props {
  account: AccountWithChildren;
  hideNumbers: boolean | undefined;
  quickActionOpen: string | boolean | undefined;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  id?: number;
}

function AccountItem({ account, hideNumbers, id, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(account.address);
  const accountAssets = useAccountAssets(account.address);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { accounts } = useContext(AccountContext);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id ?? 0 });

  const hasParent = useMemo(() => accounts.find(({ address }) => address === account.parentAddress), [account.parentAddress, accounts]);

  const [selectedAsset, setSelectedAsset] = useState<FetchedBalance | undefined>();

  const assetToShow = useMemo(() => {
    if (!accountAssets) {
      return undefined;
    }

    const defaultAssetToShow = accountAssets.find(({ genesisHash }) => genesisHash === chain?.genesisHash);

    return selectedAsset ?? defaultAssetToShow;
  }, [accountAssets, chain?.genesisHash, selectedAsset]);

  return (
    <div ref={id ? setNodeRef : null} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <Grid container {...attributes} item ref={containerRef} sx={{ borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', overflow: 'hidden', position: 'relative' }} width='760px'>
        <DragIndicatorIcon {...listeners} sx={{ ':active': { cursor: 'grabbing' }, color: 'secondary.contrastText', cursor: 'grab', fontSize: '25px', position: 'absolute', right: '5px', top: '5px' }} />
        <Grid item sx={{ bgcolor: theme.palette.nay.main, color: 'white', fontSize: '10px', ml: 5, position: 'absolute', px: 1, width: 'fit-content' }}>
          {label(account, hasParent?.name ?? '', t)}
        </Grid>
        <AccountInformationForHome
          accountAssets={accountAssets}
          address={account.address}
          hideNumbers={hideNumbers}
          isChild={!!hasParent}
          selectedAsset={assetToShow}
          setSelectedAsset={setSelectedAsset}
        />
        <Backdrop
          open={quickActionOpen !== undefined}
          sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(23, 23, 23, 0.8)' : 'rgba(241, 241, 241, 0.7)', borderRadius: '5px', bottom: '-1px', left: '-1px', position: 'absolute', right: '-1px', top: '-1px' }}
        />
        <QuickActionFullScreen
          address={account.address}
          assetId={assetToShow?.assetId}
          containerRef={containerRef}
          quickActionOpen={quickActionOpen}
          setQuickActionOpen={setQuickActionOpen}
        />
      </Grid>
    </div>
  );
}

export default React.memo(AccountItem);
