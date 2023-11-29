// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { getSubstrateAddress } from '../util/utils';
import { useAccount } from '.';

export default function useAccountName (address: string | AccountId | undefined): string | undefined {
  const [name, setName] = useState<string | undefined>();
  const substrateAddress = getSubstrateAddress(address);

  const account = useAccount(substrateAddress);

  useEffect((): void => {
    substrateAddress && setName(account?.name);
  }, [account, address, substrateAddress]);

  return name;
}
