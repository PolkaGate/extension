// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { DropdownOption } from '../util/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getAllMetadata } from '../messaging';
import chains from '../util/chains';

const RELAY_CHAIN = 'Relay Chain';

export default function useGenesisHashOptions(showAnyChain = true): DropdownOption[] {
  const [metadataChains, setMetadataChains] = useState<{ text: string; value: HexString }[]>([]);
  const metadataCache = useRef<{ text: string; value: HexString }[] | null>(null);

  useEffect(() => {
    if (!metadataCache.current) {
      getAllMetadata().then((metadataDefs) => {
        const res = metadataDefs.map((metadata) => ({ text: metadata.chain, value: metadata.genesisHash }));

        metadataCache.current = res;
        setMetadataChains(res);
      }).catch(console.error);
    } else {
      setMetadataChains(metadataCache.current);
    }
  }, []);

  const hashes = useMemo(() => {
    const allChains = [
      // put the relay chains at the top
      ...chains.filter(({ chain }) => chain.includes(RELAY_CHAIN))
        .map(({ chain, genesisHash }) => ({
          text: chain,
          value: genesisHash
        })),
      ...chains.map(({ chain, genesisHash }) => ({
        text: chain,
        value: genesisHash
      }))
        // remove the relay chains, they are at the top already
        .filter(({ text }) => !text.includes(RELAY_CHAIN))
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

    showAnyChain && allChains.unshift({ text: 'Allow use on any chain', value: '' as HexString });

    return allChains;
  }, [metadataChains, showAnyChain]);

  return hashes;
}