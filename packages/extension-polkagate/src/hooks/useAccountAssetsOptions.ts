// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '../util/types';

import { useContext, useMemo } from 'react';

import { AccountsAssetsContext } from '../components';
import { useGenesisHash } from '.';

export default function useAccountAssetsOptions(address: string | undefined): DropdownOption[] | undefined | null {
  const genesisHash = useGenesisHash(address);

  const { accountsAssets } = useContext(AccountsAssetsContext);

  return useMemo(() => {
    if (!address || !genesisHash || !accountsAssets?.balances?.[address]) {
      return undefined;
    }

    const maybeAssets = accountsAssets.balances[address][genesisHash];

    if (maybeAssets?.length) {
      return maybeAssets.map(({ assetId, token }) => ({ text: token, value: assetId }));
    }

    return null;
  }, [accountsAssets, address, genesisHash]);
}
