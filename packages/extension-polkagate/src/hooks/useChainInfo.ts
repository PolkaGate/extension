// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

import { useMemo } from 'react';

import { selectableNetworks } from '@polkadot/networks';

import { sanitizeChainName } from '../util/utils';
import { useApi2, useMetadata } from '.';

/**
 * Interface representing the information about a blockchain.
 *
 * @interface ChainInfo
 * @property {ApiPromise | undefined} api - The API instance for interacting with the blockchain. May be undefined.
 * @property {Chain | null | undefined} chain - The blockchain information (e.g., metadata, chain properties). Can be null or undefined.
 * @property {string | undefined} chainName - The name of the blockchain. Can be undefined.
 * @property {number | undefined} decimal - The number of decimals for the blockchain's token. Can be undefined.
 * @property {string | undefined} token - The symbol for the blockchain's token. Can be undefined.
 */
interface ChainInfo {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  chainName: string | undefined;
  decimal: number | undefined;
  displayName?: string;
  token: string | undefined;
}

/**
 * Custom hook to retrieve blockchain information for a given genesis hash.
 *
 * @function useChainInfo
 * @param {string | null | undefined} genesisHash - The genesis hash of the blockchain. Can be null or undefined.
 * @param {boolean} noApi - If true, prevents triggering the API connection.
 * @returns {ChainInfo} The information about the blockchain, including the API, chain metadata, name, decimals, and token symbol.
 */
export default function useChainInfo (genesisHash: string | null | undefined, noApi = false): ChainInfo {
  const chain = useMetadata(genesisHash, true);
  const api = useApi2(noApi ? undefined : genesisHash);

  return useMemo(() => {
    const chainInfo = selectableNetworks.find(({ genesisHash: chainGenesisHash }) => chainGenesisHash[0] === genesisHash);
    const chainName = sanitizeChainName(chainInfo?.displayName);
    const decimal = chainInfo?.decimals?.[0];
    const token = chainInfo?.symbols?.[0];

    if (!genesisHash) {
      return {
        api: undefined,
        chain: undefined,
        chainName: undefined,
        decimal: undefined,
        displayName: undefined,
        token: undefined
      };
    }

    return { api, chain, chainName, decimal, displayName: chainInfo?.displayName, token };
  }, [api, chain, genesisHash]);
}
