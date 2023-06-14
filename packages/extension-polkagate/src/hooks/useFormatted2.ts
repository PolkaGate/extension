// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useChain } from './';

export default function useFormatted2(address?: AccountId | string, formatted?: AccountId | string, chain: Chain | null | undefined): AccountId | string | undefined {
  const _chain = useChain(address, chain);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return formatted;
    }

    if (!_chain) {
      return;
    }

    const prefix: number = _chain.ss58Format;

    if (address && prefix !== undefined) {
      const publicKey = decodeAddress(address);

      return encodeAddress(publicKey, prefix);
    }

    return undefined;
  }, [formatted, _chain, address]);

  return encodedAddress;
}
