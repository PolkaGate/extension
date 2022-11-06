// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, SettingsContext } from '../components/contexts';
import { useChain } from '.';

export default function useFormatted(address: string): string | undefined {
  const { accounts } = useContext(AccountContext);
  const chain = useChain(address);
  const settings = useContext(SettingsContext);

  const encodedAddress = useMemo(() => {
    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

    if (prefix !== undefined) {
      const selectedAddressJson = accounts.find((acc) => acc.address === address);

      if (!selectedAddressJson) {
        throw new Error('address not found in accounts!');
      }

      const publicKey = decodeAddress(selectedAddressJson.address);

      return encodeAddress(publicKey, prefix);
    }

    return undefined;
  }, [accounts, chain, address, settings]);

  return encodedAddress;
}
