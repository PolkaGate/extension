// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useChainInfo } from '.';

export default function useFormatted (address: AccountId | string | undefined, genesisHash: string | undefined, formatted?: AccountId | string): string | undefined {
  const { chain } = useChainInfo(genesisHash);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return String(formatted);
    }

    if (!chain) {
      return;
    }

    const prefix: number = chain.ss58Format;

    try {
      const publicKey = decodeAddress(address);

      return encodeAddress(publicKey, prefix);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }, [formatted, chain, address]);

  return encodedAddress;
}
