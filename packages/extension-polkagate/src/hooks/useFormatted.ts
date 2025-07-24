// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useContext, useMemo } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext } from '../components/contexts';
import { useChain } from './';

export default function useFormatted(address?: AccountId | string, formatted?: AccountId | string): string | undefined {
  const { accounts } = useContext(AccountContext);
  const chain = useChain(address);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return String(formatted);
    }

    if (!chain) {
      return;
    }

    const prefix: number = chain.ss58Format;

    if (address && prefix !== undefined && accounts?.length) {
      const selectedAddressJson = accounts.find((acc) => acc.address === address);

      if (!selectedAddressJson) {
        console.log(`${address} not found in accounts!`);

        return undefined;
      }

      try {
        const publicKey = decodeAddress(selectedAddressJson.address);

        return encodeAddress(publicKey, prefix);
      } catch (error) {
        console.error(error);
      }
    }

    return undefined;
  }, [formatted, chain, accounts, address]);

  return encodedAddress;
}
