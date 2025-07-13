// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// /* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Asset } from '@polkagate/apps-config/assets/types';
import type { DropdownOption, UserAddedChains } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useCallback } from 'react';

import { ASSET_HUBS, RELAY_CHAINS_GENESISHASH } from '../util/constants';
import getChainName from '../util/getChainName';

const assetsChains = createAssets();

interface Params {
  worker: MessagePort | undefined;
  addresses: string[] | undefined;
  genesisOptions: DropdownOption[];
  userAddedEndpoints: UserAddedChains;
}

/**
 * Hook to encapsulate fetching assets logic.
 */
export default function useFetchAssetsOnChains ({ addresses,
  genesisOptions,
  userAddedEndpoints,
  worker }: Params) {
  const fetchAssetOnRelayChain = useCallback((_addresses: string[], chainName: string) => {
    if (!worker) {
      return 0;
    }

    const functionName = 'getAssetOnRelayChain';

    worker.postMessage({ functionName, parameters: { address: _addresses, chainName, userAddedEndpoints } });

    return 1;
  }, [userAddedEndpoints, worker]);

  const fetchAssetOnAssetHubs = useCallback((_addresses: string[], chainName: string, assetsToBeFetched?: Asset[]) => {
    if (!worker) {
      return 0;
    }

    const functionName = 'getAssetOnAssetHub';

    worker.postMessage({ functionName, parameters: { address: _addresses, assetsToBeFetched, chainName, userAddedEndpoints } });

    return 1;
  }, [userAddedEndpoints, worker]);

  const fetchAssetOnMultiAssetChain = useCallback((addresses: string[], chainName: string) => {
    if (!worker) {
      return 0;
    }

    const functionName = 'getAssetOnMultiAssetChain';

    worker.postMessage({ functionName, parameters: { addresses, chainName, userAddedEndpoints } });

    return 1;
  }, [userAddedEndpoints, worker]);

  const fetchMultiAssetChainAssets = useCallback((chainName: string) => {
    return addresses ? fetchAssetOnMultiAssetChain(addresses, chainName) : 0;
  }, [addresses, fetchAssetOnMultiAssetChain]);

  const fetchAssets = useCallback((genesisHash: string, isSingleTokenChain: boolean, maybeMultiAssetChainName: string | undefined) => {
    if (!addresses?.length) {
      console.log('No address to fetch assets!');

      return 0;
    }

    let callsMade = 0;

    if (RELAY_CHAINS_GENESISHASH.includes(genesisHash) || isSingleTokenChain) {
      const chainName = getChainName(genesisHash, genesisOptions);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!', genesisHash);

        return callsMade;
      }

      callsMade += fetchAssetOnRelayChain(addresses, chainName);

      return callsMade;
    }

    if (ASSET_HUBS.includes(genesisHash)) {
      const chainName = getChainName(genesisHash);

      if (!chainName) {
        console.error('can not find chain name by genesis hash!', genesisHash);

        return callsMade;
      }

      const assetsToBeFetched = assetsChains?.[chainName];

      if (!assetsToBeFetched) {
        console.warn(`No assets config found for ${chainName}`);

        return callsMade;
      }

      callsMade += fetchAssetOnAssetHubs(addresses, chainName, assetsToBeFetched);

      return callsMade;
    }

    if (maybeMultiAssetChainName) {
      callsMade += fetchMultiAssetChainAssets(maybeMultiAssetChainName);
    }

    return callsMade;
  }, [addresses, fetchAssetOnAssetHubs, fetchAssetOnRelayChain, fetchMultiAssetChainAssets, genesisOptions]);

  return { fetchAssets };
}
