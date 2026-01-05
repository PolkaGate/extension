// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { decodeAddress, encodeAddress, evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';

import useChainInfo from './useChainInfo';

export default function useFormatted(address: AccountId | string | undefined, genesisHash: string | null | undefined, formatted?: AccountId | string): string | undefined {
  const { chain } = useChainInfo(genesisHash, true);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return String(formatted);
    }

    if (!chain || !address) {
      return;
    }

    const { definition: { chainType }, ss58Format } = chain;

    try {
      let strAddress = String(address);

      if (isEthereumAddress(strAddress)) {
        if (chainType === 'ethereum') {
        return strAddress;
        }

        strAddress = evmToAddress(strAddress);
      }

      if (ss58Format !== undefined) {
        const publicKey = decodeAddress(strAddress);

        return encodeAddress(publicKey, ss58Format);
      }
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }, [formatted, chain, address]);

  return encodedAddress;
}
