// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useChain } from './';

/** We use chain here to fetch formatted address */
export default function useFormatted2(address: AccountId | string | undefined, formatted: AccountId | string | undefined, chain: Chain | null | undefined): AccountId | string | undefined {
  const _chain = useChain(address, chain);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return formatted;
    }

    if (!_chain) {
      return;
    }

    const prefix: number = _chain.ss58Format;

    try {
      if (address && prefix !== undefined) {
        const publicKey = decodeAddress(address);

        return encodeAddress(publicKey, prefix);
      }
    } catch (error) {
      console.error('error in useFormatted 2:', error);
    }

    return undefined;
  }, [formatted, _chain, address]);

  return encodedAddress;
}
