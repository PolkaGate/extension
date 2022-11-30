// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { canDerive } from '@polkadot/extension-base/utils';

import { getFormattedAddress } from './utils';

export default function getAllAddresses(hierarchy: AccountWithChildren[], filterExternal = true, formatted = false, formatType: number | undefined, ignoredAddress?: string | undefined): [string, string | null, string | undefined][] {
  const allAddresses = hierarchy
    .filter(({ isExternal }) => filterExternal ? !isExternal : isExternal || !isExternal)
    .filter(({ type }) => canDerive(type))
    .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => {
      return ([formatted ? getFormattedAddress(address, undefined, formatType) : address, genesisHash || null, name]);
    });

  if (ignoredAddress) {
    return allAddresses.filter((item) => item[0] !== ignoredAddress);
  }

  return allAddresses;
}
