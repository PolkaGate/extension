// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { DropdownOption } from '../util/types';

import { useEffect, useMemo, useState } from 'react';

import { getAllMetadata } from '../messaging';
import chains from '../util/chains';
import { useIsTestnetEnabled } from '.';

const RELAY_CHAIN = 'Relay Chain';
const ASSET_HUB = 'Asset Hub';

interface MetadataOption { text: string; value: HexString }
type ChainType = 'ethereum' | 'substrate';

const metadataCacheByType: Partial<Record<ChainType, MetadataOption[]>> = {};
const metadataRequestByType: Partial<Record<ChainType, Promise<MetadataOption[]>>> = {};

function getMetadataChains(chainType: ChainType): Promise<MetadataOption[]> {
  if (metadataCacheByType[chainType]) {
    return Promise.resolve(metadataCacheByType[chainType] ?? []);
  }

  if (!metadataRequestByType[chainType]) {
    metadataRequestByType[chainType] = getAllMetadata()
      .then((metadataDefs) => {
        const options = metadataDefs
          .filter((metadata) => metadata.chainType === chainType)
          .map((metadata) => ({ text: metadata.chain, value: metadata.genesisHash }));

        metadataCacheByType[chainType] = options;
        delete metadataRequestByType[chainType];

        return options;
      })
      .catch((error) => {
        delete metadataRequestByType[chainType];

        throw error;
      });
  }

  return metadataRequestByType[chainType] ?? Promise.resolve([]);
}

export default function useGenesisHashOptions({ isEthereum = false, withRelay = true }: { isEthereum?: boolean; withRelay?: boolean }): DropdownOption[] {
  const isTestnetEnabled = useIsTestnetEnabled();
  const [metadataChains, setMetadataChains] = useState<MetadataOption[]>([]);

  useEffect(() => {
    const chainType: ChainType = isEthereum ? 'ethereum' : 'substrate';

    getMetadataChains(chainType)
      .then(setMetadataChains)
      .catch(console.error);
  }, [isEthereum]);

  return useMemo(() => {
    const testnetFilteredChains =
      isTestnetEnabled
        ? chains
        : chains.filter(({ isTestnet }) => !isTestnet);

    const protocolFilteredChains =
      isEthereum
        ? testnetFilteredChains.filter((chain) => chain.isEthereum)
        : testnetFilteredChains;

    const knownGenesisHashes = new Set(chains.map(({ genesisHash }) => genesisHash));
    const metadataOnlyChains = metadataChains.filter(({ value }) => !knownGenesisHashes.has(value));
    const relayChains = protocolFilteredChains
      .filter(({ chain }) => chain.includes(RELAY_CHAIN))
      .map(({ chain, genesisHash }) => ({ text: chain, value: genesisHash }));
    const nonRelayChains = protocolFilteredChains
      .filter(({ chain }) => !chain.includes(RELAY_CHAIN))
      .map(({ chain, genesisHash }) => ({ text: chain, value: genesisHash }))
      .concat(metadataOnlyChains)
      .sort((a, b) => a.text.localeCompare(b.text));

    const allChains = [
      ...relayChains,
      ...nonRelayChains
    ];

    if (!withRelay) {
      const nonRelayChainsOnly = allChains.filter(({ text }) => !text.includes(RELAY_CHAIN));
      const assetHubFirstChains = [
        ...nonRelayChainsOnly.filter(({ text }) => text.includes(ASSET_HUB)),
        ...nonRelayChainsOnly.filter(({ text }) => !text.includes(ASSET_HUB))
      ];

      return assetHubFirstChains.map((chain) => ({
        ...chain,
        text: chain.text.includes(ASSET_HUB)
          ? chain.text.replace(ASSET_HUB, '').trim()
          : chain.text
      }));
    }

    return allChains;
  }, [isEthereum, isTestnetEnabled, metadataChains, withRelay]);
}
