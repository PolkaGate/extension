// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { AccountsAssetsContext } from '../components';
import { AccountAssets } from '../util/types';

export default function useAccountAssets (address: string | undefined): AccountAssets[] | undefined | null {
  const [accountAssets, setAccountAssets] = useState<AccountAssets[] | undefined | null>();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  useEffect(() => {
    if (!address || !accountsAssets) {
      return;
    }

    const assets = accountsAssets.balances.find((balance) => balance.address === address)?.assets;

    setAccountAssets(assets && assets.length > 0 ? assets : assets && assets.length === 0 ? null : undefined);
  }, [accountsAssets, address]);

  return accountAssets;
}
