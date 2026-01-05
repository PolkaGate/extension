// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback, useMemo } from 'react';

import { ASSET_HUBS, FETCHING_ASSETS_FUNCTION_NAMES, RELAY_CHAINS_GENESISHASH } from '../util/constants';
import getChainName from '../util/getChainName';

interface Params {
  worker: MessagePort | undefined;
  addresses: string[] | undefined;
  genesisOptions: DropdownOption[];
  userAddedEndpoints: UserAddedChains;
}

// 0 = request not sent; 1 = request sent to worker successfully
const FAILED = 0;
const SUCCESSFUL = 1;

/**
 * Hook to encapsulate logic for dispatching asset-fetching requests
 * to a worker, based on chain type.
 */
export default function useFetchAssetsOnChains({ addresses, genesisOptions, userAddedEndpoints, worker }: Params) {
  const assetsChains = useMemo(() => createAssets(), []);

  const postToWorker = useCallback((functionName: string, parameters: Record<string, unknown>): number => {
    if (!worker) {
      console.warn(`Worker is undefined — skipping ${functionName}`);

      return FAILED;
    }

    worker.postMessage({ functionName, parameters });

    return SUCCESSFUL;
  }, [worker]);

  const fetchAssetOnAssetHub = useCallback((chainName: string, _addresses: string[]) => {
    const assetsToBeFetched = assetsChains?.[chainName];

    if (!assetsToBeFetched) {
      console.warn(`No assets config found for ${chainName}`);

      return FAILED;
    }

    return postToWorker(FETCHING_ASSETS_FUNCTION_NAMES.ASSET_HUB, {
      addresses: _addresses,
      assetsToBeFetched,
      chainName,
      userAddedEndpoints
    });
  }, [assetsChains, postToWorker, userAddedEndpoints]);

  const fetchAssetOnRelayChain = useCallback((chainName: string, _addresses: string[]) =>
    postToWorker(FETCHING_ASSETS_FUNCTION_NAMES.RELAY, {
      addresses: _addresses,
      chainName,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchAssetOnMultiAssetChain = useCallback((chainName: string, _addresses: string[]) =>
    postToWorker(FETCHING_ASSETS_FUNCTION_NAMES.MULTI_ASSET, {
      addresses: _addresses,
      chainName,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, maybeMultiAssetChainName?: string): number => {
    if (!addresses?.length) {
      console.warn('No addresses provided to fetch assets.');

      return FAILED;
    }

    // Relay chains or chains with a single token
    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      const chainName = getChainName(genesisHash, genesisOptions);

      if (!chainName) {
        console.error('Unable to resolve chain name for relay/single-token chain:', genesisHash);

        return FAILED;
      }

      return fetchAssetOnRelayChain(chainName, addresses);
    }

    // Asset hubs (like Statemint)
    if (ASSET_HUBS.includes(genesisHash)) {
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('Unable to resolve chain name for asset hub:', genesisHash);

        return FAILED;
      }

      return fetchAssetOnAssetHub(chainName, addresses);
    }

    // Other chains supporting multi-asset logic
    if (maybeMultiAssetChainName) {
      return fetchAssetOnMultiAssetChain(maybeMultiAssetChainName, addresses);
    }

    return FAILED;
  }, [addresses, genesisOptions, fetchAssetOnRelayChain, fetchAssetOnAssetHub, fetchAssetOnMultiAssetChain]);

  return { fetchAssets };
}
