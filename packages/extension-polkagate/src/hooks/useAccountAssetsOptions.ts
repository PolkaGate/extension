// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { AccountsAssetsContext } from '../components';
import { DropdownOption } from '../util/types';
import { useGenesisHash } from '.';

export default function useAccountAssetsOptions (address: string | undefined): DropdownOption[] | undefined | null {
  const genesisHash = useGenesisHash(address);

  const { accountsAssets } = useContext(AccountsAssetsContext);

  return useMemo(() => {
    if (!address || !genesisHash || !accountsAssets?.balances?.[address]) {
      return undefined;
    }

    const maybeAssets = accountsAssets.balances[address][genesisHash];

    if (maybeAssets?.length) {
      return maybeAssets.map(({ assetId, token }) => ({ text: token, value: assetId || -1 })); // since native token does not have asset id we set 0
    }

    return null;
  }, [accountsAssets, address, genesisHash]);
}
