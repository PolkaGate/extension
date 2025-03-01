// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SavedAssets } from '@polkadot/extension-polkagate/hooks/useAssetsBalances';

import React, { useContext, useEffect, useState } from 'react';

import { AccountContext, AccountsAssetsContext, AlertContext, GenesisHashOptionsContext, UserAddedChainContext, WorkerContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import useAssetsBalances, { ASSETS_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import useNFT from '@polkadot/extension-polkagate/src/hooks/useNFT';

export default function AccountAssetProvider({ children }: { children: React.ReactNode }) {
  const { accounts } = useContext(AccountContext);
  const genesisHashOptions = useContext(GenesisHashOptionsContext);
  const { setAlerts } = useContext(AlertContext);
  const userAddedChainCtx = useContext(UserAddedChainContext);
  const worker = useContext(WorkerContext);

  const [accountsAssets, setAccountsAssets] = useState<SavedAssets | null | undefined>();

  const assetsOnChains = useAssetsBalances(accounts, setAlerts, genesisHashOptions, userAddedChainCtx, worker);

  useNFT(accounts);

  useEffect(() => {
    assetsOnChains && setAccountsAssets({ ...assetsOnChains });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetsOnChains?.timeStamp]);

  useEffect(() => {
    /** remove forgotten accounts from assetChains if any */
    if (accounts && assetsOnChains?.balances) {
      Object.keys(assetsOnChains.balances).forEach((_address) => {
        const found = accounts.find(({ address }) => address === _address);

        if (!found) {
          delete assetsOnChains.balances[_address];
          setStorage(ASSETS_NAME_IN_STORAGE, assetsOnChains, true).catch(console.error);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, assetsOnChains?.timeStamp]);

  return (
    <AccountsAssetsContext.Provider value={{ accountsAssets, setAccountsAssets }}>
      {children}
    </AccountsAssetsContext.Provider>
  );
}
