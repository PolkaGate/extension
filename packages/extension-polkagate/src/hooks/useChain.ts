// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chain } from '@polkadot/extension-chains/types';

import { useAccount, useMetadata } from './';

export default function useChain(address: string | undefined): Chain | null {
  const account = useAccount(address);

  return useMetadata(account?.genesisHash, true);
}
