// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
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

      const publicKey = decodeAddress(selectedAddressJson.address);

      return encodeAddress(publicKey, prefix);
    }

    return undefined;
  }, [formatted, chain, accounts, address]);

  return encodedAddress;
}
