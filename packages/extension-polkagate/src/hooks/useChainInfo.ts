// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

import { useMemo } from 'react';

import chains from '../util/chains';
import { isMigrated } from '../util/migrateHubUtils';
import { sanitizeChainName } from '../util/utils';
import useApi from './useApi';
import useMetadata from './useMetadata';

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
  const api = useApi(noApi ? undefined : genesisHash);

  return useMemo(() => {
    const chainInfo = chains.find(({ genesisHash: chainGenesisHash }) => chainGenesisHash === genesisHash);
    const chainName = sanitizeChainName(chainInfo?.chain ?? chain?.name, true);
    const decimal = chainInfo?.tokenDecimal;
    const token = chainInfo?.tokenSymbol;
    const displayName = isMigrated(genesisHash ?? '') ? chainName : chainInfo?.name ?? chainName;

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

    return {
      api,
      chain,
      chainName,
      decimal: decimal ?? chain?.tokenDecimals,
      displayName,
      token: token ?? chain?.tokenSymbol
    };
  }, [api, chain, genesisHash]);
}
