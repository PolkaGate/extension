// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { decodeAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';

import useChainInfo from './useChainInfo';

export default function useFormatted (address: AccountId | string | undefined, genesisHash: string | null | undefined, formatted?: AccountId | string): string | undefined {
  const { chain } = useChainInfo(genesisHash, true);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return String(formatted);
    }

    if (!chain || !address) {
      return;
    }

    const prefix: number = chain.ss58Format;

    try {
      const strAddress = String(address);

      if (isEthereumAddress(strAddress)) {
        return strAddress;
      }

      if (address && prefix !== undefined) {
        const publicKey = decodeAddress(address);

        return encodeAddress(publicKey, prefix);
      }
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }, [formatted, chain, address]);

  return encodedAddress;
}
