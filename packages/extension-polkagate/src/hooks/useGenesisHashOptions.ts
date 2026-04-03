// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { DropdownOption } from '../util/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getAllMetadata } from '../messaging';
import chains from '../util/chains';
import { useIsTestnetEnabled } from '.';

const RELAY_CHAIN = 'Relay Chain';
const ASSET_HUB = 'Asset Hub';

export default function useGenesisHashOptions({ isEthereum = false, withRelay = true }: { isEthereum?: boolean; withRelay?: boolean }): DropdownOption[] {
  const metadataCache = useRef<{ text: string; value: HexString }[] | null>(null);
  const isTestnetEnabled = useIsTestnetEnabled();

  const [metadataChains, setMetadataChains] = useState<{ text: string; value: HexString }[]>([]);

  useEffect(() => {
    if (!metadataCache.current) {
      getAllMetadata().then((metadataDefs) => {
        const res = metadataDefs
          .filter(({ chainType }) => isEthereum ? chainType === 'ethereum' : chainType === 'substrate')
          .map((metadata) => ({ text: metadata.chain, value: metadata.genesisHash }));

        metadataCache.current = res;
        setMetadataChains(res);
      }).catch(console.error);
    } else {
      setMetadataChains(metadataCache.current);
    }
  }, [isEthereum]);

  return useMemo(() => {
    const testNetFiltered = isTestnetEnabled
      ? chains
      : chains.filter(({ isTestnet }) => !isTestnet);

    const evmFiltered =
      isEthereum
        ? testNetFiltered.filter((chain) => chain.isEthereum === isEthereum)
        : testNetFiltered;

    const allChains = [
      // put the relay chains at the top
      ...evmFiltered.filter(({ chain }) => chain.includes(RELAY_CHAIN))
        .map(({ chain, genesisHash }) => ({
          text: chain,
          value: genesisHash
        })),
      ...evmFiltered.map(({ chain, genesisHash }) => ({
        text: chain,
        value: genesisHash
      }))
        // remove the relay chains, they are at the top already
        .filter(({ text }) => !text.includes(RELAY_CHAIN))
        // remove the migrated hub system chains, we address them by ecosystem chain
        // .filter(({ value }) => !isMigratedHub(value))
        .concat(
          // get any chain present in the metadata and not already part of chains
          ...metadataChains.filter(
            ({ value }) => {
              return !chains.find(({ genesisHash }) => genesisHash === value);
            }
          )
        )
        // filter testnets if it is not enabled by user
        .sort((a, b) => a.text.localeCompare(b.text))
    ];

    if (!withRelay) {
      const filteredRelay = allChains.filter(({ text }) => !text.includes(RELAY_CHAIN));

      const temp = [
        ...filteredRelay.filter(({ text }) => text.includes(ASSET_HUB)),
        ...filteredRelay.filter(({ text }) => !text.includes(ASSET_HUB))
      ];

    return temp.map((hub) => {
          if (hub.text.includes(ASSET_HUB)) {
            hub.text = hub.text.replace(ASSET_HUB, '');
          }

          return hub;
        });
    }

    return allChains;
  }, [isEthereum, isTestnetEnabled, metadataChains, withRelay]);
}
