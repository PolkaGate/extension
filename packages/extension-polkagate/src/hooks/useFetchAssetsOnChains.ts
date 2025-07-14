// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback, useMemo } from 'react';

import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH } from '../util/constants';
import getChainName from '../util/getChainName';

interface Params {
  worker?: MessagePort;
  addresses?: string[];
  genesisOptions: DropdownOption[];
  userAddedEndpoints: UserAddedChains;
}

// Function names for worker calls
const FUNCTION_NAMES = {
  ASSET_HUB: 'getAssetOnAssetHub',
  MULTI_ASSET: 'getAssetOnMultiAssetChain',
  RELAY: 'getAssetOnRelayChain'
};

/**
 * Hook to encapsulate logic for dispatching asset-fetching requests
 * to a worker, based on chain type.
 */
export default function useFetchAssetsOnChains({ addresses, genesisOptions, userAddedEndpoints, worker }: Params) {
  const assetsChains = useMemo(() => createAssets(), []);

  const postToWorker = useCallback((functionName: string, parameters: Record<string, unknown>): number => {
    if (!worker) {
      console.warn(`Worker is undefined — skipping ${functionName}`);

      return 0;
    }

    worker.postMessage({ functionName, parameters });

    return 1;
  }, [worker]);

  const fetchAssetOnAssetHub = useCallback((chainName: string, _addresses: string[]) => {
    const assetsToBeFetched = assetsChains?.[chainName];

    if (!assetsToBeFetched) {
      console.warn(`No assets config found for ${chainName}`);

      return 0;
    }

    return postToWorker(FUNCTION_NAMES.ASSET_HUB, {
      addresses: _addresses,
      assetsToBeFetched,
      chainName,
      userAddedEndpoints
    });
  }, [assetsChains, postToWorker, userAddedEndpoints]);

  const fetchAssetOnRelayChain = useCallback((chainName: string, _addresses: string[]) =>
    postToWorker(FUNCTION_NAMES.RELAY, {
      addresses: _addresses,
      chainName,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchAssetOnMultiAssetChain = useCallback((chainName: string, _addresses: string[]) =>
    postToWorker(FUNCTION_NAMES.MULTI_ASSET, {
      addresses: _addresses,
      chainName,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, maybeMultiAssetChainName?: string): number => {
    if (!addresses?.length) {
      console.warn('No addresses provided to fetch assets.');

      return 0;
    }

    let callsMade = 0;

    // Relay chains or chains with a single token
    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      const chainName = getChainName(genesisHash, genesisOptions);

      if (!chainName) {
        console.error(
          'Unable to resolve chain name for relay/single-token chain:',
          genesisHash
        );

        return callsMade;
      }

      return fetchAssetOnRelayChain(chainName, addresses);
    }

    // Asset hubs (like Statemint)
    if (ASSET_HUBS.includes(genesisHash)) {
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('Unable to resolve chain name for asset hub:', genesisHash);

        return callsMade;
      }

      return fetchAssetOnAssetHub(chainName, addresses);
    }

    // Other chains supporting multi-asset logic
    if (maybeMultiAssetChainName) {
      callsMade += fetchAssetOnMultiAssetChain(maybeMultiAssetChainName, addresses);
    }

    return callsMade;
  }, [addresses, genesisOptions, fetchAssetOnRelayChain, fetchAssetOnAssetHub, fetchAssetOnMultiAssetChain]);

  return { fetchAssets };
}
