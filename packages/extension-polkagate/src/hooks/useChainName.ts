// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useChain } from './';

export default function useChainName(address: AccountId | string | undefined): string | undefined {
  const chain = useChain(address);

  return chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '')?.replace(' chain', '')?.replace(' Chain', '');
}
