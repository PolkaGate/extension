// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { useCallback, useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../util';

export const ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE = 'accountSelectedChain';

/**
 * Retrieves the selected chain's genesis hash for a given account address from storage.
 *
 * This custom hook fetches the genesis hash associated with the provided account address from localStorage.
 * If the address is found, it returns the corresponding genesis hash; otherwise, it returns `null`.
 * If the storage is empty or the address is not present, it returns `null`.
 *
 * @param {string | undefined} address - The account address for which to fetch the selected chain's genesis hash.
 * @returns {HexString | undefined | null} The genesis hash of the selected chain, or `null` if not found or invalid.
 *
 */
export default function useAccountSelectedChain (address: string | undefined): HexString | undefined | null {
  const [genesisHash, setGenesisHash] = useState<HexString | null>();

  const handleGenesis = useCallback((res: string | object) => {
    if (!address) {
      return;
    }

    let parsedRes: Record<string, HexString> | null = null;

    if (typeof res === 'object' && res !== null) {
      parsedRes = res as Record<string, HexString>;
    } else if (typeof res === 'string') {
      try {
        parsedRes = JSON.parse(res) as Record<string, HexString>;
      } catch {
        parsedRes = null;
      }
    }

    if (!parsedRes || JSON.stringify(parsedRes) === '{}') {
      return setGenesisHash(POLKADOT_GENESIS);
    }

    if (address in parsedRes) {
      setGenesisHash(parsedRes[address] as HexString | undefined ?? POLKADOT_GENESIS);
    } else {
      setGenesisHash(POLKADOT_GENESIS);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      return;
    }

    getStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE).then((res: string | object) => {
      handleGenesis(res);
    }).catch((error) => {
      console.log(error);
      setGenesisHash(null);
    });

    const unsubscribe = watchStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, handleGenesis);

    return () => {
      unsubscribe();
    };
  }, [address, handleGenesis]);

  return genesisHash;
}
