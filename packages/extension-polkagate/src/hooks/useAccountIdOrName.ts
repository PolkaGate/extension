// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useAccountName, useMyAccountIdentity } from '.';

/**
 * @description A hook that returns either the display name from the account's identity or the account name.
 * @param address The account address or ID.
 * @returns The account display name, if available.
 */
export default function useAccountIdOrName (address: string | AccountId | undefined): string | undefined {
  const identity = useMyAccountIdentity(address);
  const name = useAccountName(address);

  return identity?.display || name;
}
