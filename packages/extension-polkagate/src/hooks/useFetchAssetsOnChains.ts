// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback, useMemo } from 'react';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { ASSET_HUBS, FETCHING_ASSETS_FN, RELAY_CHAINS_GENESISHASH } from '../util/constants';
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

  const fetchAssetOnAssetHub = useCallback((chainName: string, addresses: string[]) => {
    const assetsToBeFetched = assetsChains?.[chainName];

    if (!assetsToBeFetched) {
      console.warn(`No assets config found for ${chainName}`);

      return FAILED;
    }

    return postToWorker(FETCHING_ASSETS_FN.ASSET_HUB, {
      addresses,
      assetsToBeFetched,
      chainName,
      userAddedEndpoints
    });
  }, [assetsChains, postToWorker, userAddedEndpoints]);

  const fetchAssetOnSingleAssetChain = useCallback((chainName: string, addresses: string[]) =>
    postToWorker(FETCHING_ASSETS_FN.SINGLE_ASSET, {
      addresses,
      chainName,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchAssetOnMultiAssetChain = useCallback((chainName: string, addresses: string[]) =>
    postToWorker(FETCHING_ASSETS_FN.MULTI_ASSET, {
      addresses,
      chainName,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchEthAssets = useCallback((chainName: string, addresses: string[]) =>
    postToWorker(FETCHING_ASSETS_FN.ETH, {
      addresses,
      chainName
    }), [postToWorker]);

  const fetchEVMAssets = useCallback((genesisHash: string, chainName: string, addresses: string[]) =>
    postToWorker(FETCHING_ASSETS_FN.EVM, {
      addresses,
      chainName,
      genesisHash,
      userAddedEndpoints
    }), [postToWorker, userAddedEndpoints]);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, isEthChain: boolean, maybeMultiAssetChainName?: string, isEvmChain?: boolean): number => {
    const chainName = getChainName(genesisHash, genesisOptions);

    if (!addresses?.length) {
      console.warn('No addresses provided to fetch assets.');

      return FAILED;
    }

    const { evm: evmAddresses, substrate: substrateAddresses } = addresses.reduce((res, address) => {
      (isEthereumAddress(address)
        ? res.evm
        : res.substrate
      ).push(address);

      return res;
    }, { evm: [] as string[], substrate: [] as string[] });

    if (evmAddresses?.length) {
      if (!chainName) {
        console.error('Unable to resolve chain name for evm chain:', genesisHash);

        return FAILED;
      }

      if (isEthChain) {
        return fetchEthAssets(chainName, evmAddresses);
      }

      if (isEvmChain) {
        return fetchEVMAssets(genesisHash, chainName, evmAddresses);
      }
    }

    if (!substrateAddresses?.length) {
      return FAILED;
    }

    // Relay chains or chains with a single token
    // FixMe, we do not get assets on relay chains any more
    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      if (!chainName) {
        console.error('Unable to resolve chain name for relay/single-token chain:', genesisHash);

        return FAILED;
      }

      return fetchAssetOnSingleAssetChain(chainName, substrateAddresses);
    }

    // Asset hubs (like Statemint)
    if (ASSET_HUBS.includes(genesisHash)) {
      if (!chainName) {
        console.error('Unable to resolve chain name for asset hub:', genesisHash);

        return FAILED;
      }

      return fetchAssetOnAssetHub(chainName, substrateAddresses);
    }

    // Other chains supporting multi-asset logic
    if (maybeMultiAssetChainName) {
      return fetchAssetOnMultiAssetChain(maybeMultiAssetChainName, substrateAddresses);
    }

    return FAILED;
  }, [genesisOptions, addresses, fetchEthAssets, fetchEVMAssets, fetchAssetOnSingleAssetChain, fetchAssetOnAssetHub, fetchAssetOnMultiAssetChain]);

  return { fetchAssets };
}
