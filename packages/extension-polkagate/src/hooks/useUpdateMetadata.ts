// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints } from '@polkagate/apps-config';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { MetadataDef } from '@polkadot/extension-inject/types';
import { getSpecTypes } from '@polkadot/types-known';
import { formatBalance, isNumber } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';

import { getAllMetadata, updateMetadata } from '../messaging';
import type { APIs } from '../util/types';

/**
 * @description
 * This hook will automatically update the metadata on different chains.
 */

export default function useUpdateMetadata (accounts: AccountJson[], apis: APIs) {
  const endpoints = createWsEndpoints();

  const [metadataList, setMetadataList] = useState<MetadataDef[]>();
  const [updatingMetadata, setUpdating] = useState<boolean>(false);

  const apiGenesisHashes = Object.keys(apis);
  const apiRequests = useMemo(() => apiGenesisHashes.flatMap((genesisHash) => apis[genesisHash]), [apis, apiGenesisHashes]);

  // Fetch metadata
  const getMetadata = useCallback(() => {
    getAllMetadata()
      .then(setMetadataList)
      .catch(console.error);
  }, []);

  // Derive unique genesis hashes from accounts
  const accountsChains = useMemo(() => {
    const accountsGenesishash = accounts
      .map(({ genesisHash }) => genesisHash)
      .filter((accountGenesishash) => !!accountGenesishash) as string[];

    return [...new Set(accountsGenesishash)];
  }, [accounts]);

  // Get chain color by genesis hash
  const getChainColor = useCallback((genesisHash: string) => {
    const color = endpoints
      .find(({ genesisHash: _genesisHash, ui }) => _genesisHash === genesisHash && ui.color)
      ?.ui.color;

    return color;
  }, [endpoints]);

  // Update metadata for a specific chain using API
  const _updateMetadata = useCallback(async (api: ApiPromise) => {
    const DEFAULT_DECIMALS = api.registry.createType('u32', 12);
    const DEFAULT_SS58 = api.registry.createType('u32', 42);
    const chainName = api.runtimeChain.toHuman();
    const chainGenesisHash = api.genesisHash.toHex();

    const metadata = {
      chain: chainName,
      chainType: 'substrate',
      color: getChainColor(chainGenesisHash),
      genesisHash: chainGenesisHash,
      icon: 'substrate',
      metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      ss58Format: isNumber(api.registry.chainSS58)
        ? api.registry.chainSS58
        : DEFAULT_SS58.toNumber(),
      tokenDecimals: (api.registry.chainDecimals || [DEFAULT_DECIMALS.toNumber()])[0],
      tokenSymbol: (api.registry.chainTokens || formatBalance.getDefaults().unit)[0],
      types: getSpecTypes(api.registry, chainName, api.runtimeVersion.specName, api.runtimeVersion.specVersion) as unknown as Record<string, string>
    } as MetadataDef;

    await updateMetadata(metadata).catch(console.error);
    console.log(`${chainName} metadata updated!`);
  }, [getChainColor]);

  // Check and update metadata if needed
  const checkAndUpdateMetadata = useCallback(async (apiList: APIs, _metadataList: MetadataDef[]) => {
    setUpdating(true);

    for (const chainGenesisHash in apiList) {
      if (apiList.hasOwnProperty(chainGenesisHash)) {
        const metadata = _metadataList.find(({ genesisHash }) => chainGenesisHash === genesisHash);
        const api = apiList[chainGenesisHash].find(({ api }) => api?.isConnected)?.api;
        const savedMetadataVersion = metadata?.specVersion;
        const newMetadataVersion = api?.runtimeVersion.specVersion.toNumber();

        if (savedMetadataVersion && newMetadataVersion && savedMetadataVersion >= newMetadataVersion) {
          console.log(`${api?.runtimeChain.toHuman() ?? ''} metadata is updated!`);

          continue;
        }

        if (api) {
          setMetadataList(undefined);
          await _updateMetadata(api).catch(console.error);
          getMetadata();
        }
      }
    }

    setUpdating(false);
  }, [_updateMetadata, getMetadata]);

  // Fetch metadata on component mount
  useEffect(() => {
    getMetadata();
  }, [getMetadata]);

  // Check and update metadata on dependency change
  useEffect(() => {
    if (!metadataList || accountsChains.length === 0 || updatingMetadata || apiRequests.length === 0 || apiGenesisHashes.length === 0) {
      return;
    }

    if (accountsChains.every((hash) => apiGenesisHashes.includes(hash))) {
      const allConnected = accountsChains
        .every((genesishash) => apis[genesishash]
          .some(({ api }) => api?.isConnected));

      if (allConnected) {
        checkAndUpdateMetadata(apis, metadataList).catch(console.error);
      }
    }
  }, [accountsChains, accountsChains?.length, apiGenesisHashes, apiGenesisHashes.length, apiRequests, apiRequests.length, apis, checkAndUpdateMetadata, metadataList, updatingMetadata]);
}
