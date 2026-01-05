// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useAccountName, useMyAccountIdentity } from '.';

/**
 * @description A hook that returns either the display name from the account's identity or the account name.
 * @param address The account address or ID.
 * @returns The account display name, if available.
 */
export default function useAccountDisplay(address: string | undefined, genesisHash: string | null | undefined): string | undefined {
  const accountIdentityName = useMyAccountIdentity(address, genesisHash)?.display;
  const accountName = useAccountName(address);

  return useMemo(() =>
    accountIdentityName ?? accountName
    , [accountIdentityName, accountName]);
}
