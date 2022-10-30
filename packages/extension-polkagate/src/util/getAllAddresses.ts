// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { canDerive } from '@polkadot/extension-base/utils';

import getFormatted from './getFormatted';

export default function getAllAddressess(hierarchy: AccountWithChildren[], formatted = false, formatType: number | undefined, ignore: string | undefined): [string, string | null, string | undefined][] {
  const allAddresses = hierarchy
    .filter(({ isExternal }) => !isExternal)
    .filter(({ type }) => canDerive(type))
    .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => {
      return ([formatted ? getFormatted(address, formatType) : address, genesisHash || null, name]);
    });

  if (ignore) {
    return allAddresses.filter((item) => item[0] !== ignore);
  }

  return allAddresses;
}
