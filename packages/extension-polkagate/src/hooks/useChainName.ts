// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { sanitizeChainName } from '../util/utils';
import { useChain } from './';

export default function useChainName(address: AccountId | string | undefined | null): string | undefined {
  const chain = useChain(address);

  return sanitizeChainName(chain?.name);
}
