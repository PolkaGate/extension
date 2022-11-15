// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, SettingsContext } from '../components/contexts';
import { useChain } from './';

export default function useFormatted(address?: string, formatted?: string): string | undefined {
  const { accounts } = useContext(AccountContext);
  const settings = useContext(SettingsContext);
  const chain = useChain(address);

  const encodedAddress = useMemo(() => {
    if (formatted) {
      return formatted;
    }

    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

    if (prefix !== undefined) {
      const selectedAddressJson = accounts.find((acc) => acc.address === address);

      if (!selectedAddressJson) {
        console.log('address not found in accounts!');

        return undefined;
      }

      const publicKey = decodeAddress(selectedAddressJson.address);

      return encodeAddress(publicKey, prefix);
    }

    return undefined;
  }, [formatted, chain, settings.prefix, accounts, address]);

  return encodedAddress;
}
