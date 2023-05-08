// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { getAllMetadata } from '../messaging';
import chains from '../util/chains';
import { useTranslation } from '.';
import { TEST_NETS } from '../util/constants';

interface Option {
  text: string;
  value: string;
}

const RELAY_CHAIN = 'Relay Chain';

export default function (): Option[] {
  const { t } = useTranslation();
  const [metadataChains, setMetadatachains] = useState<Option[]>([]);
  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();

  useEffect(() =>
    chrome.storage.local.get('testnet_enabled', (res) => setIsTestnetEnabled(res?.testnet_enabled))
    , []);

  useEffect(() => {
    getAllMetadata().then((metadataDefs) => {
      const res = metadataDefs.map((metadata) => ({ text: metadata.chain, value: metadata.genesisHash }));

      setMetadatachains(res);
    }).catch(console.error);
  }, []);

  const hashes = useMemo(() => [
    {
      text: t('Allow use on any chain'),
      value: ''
    },
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
            return !chains.find(
              ({ genesisHash }) => genesisHash === value);
          }
        ))
      // filter testnets if it is not enabled by user
      .filter(({ text }) => !isTestnetEnabled ? !TEST_NETS.includes(text) : true)
      .sort((a, b) => a.text.localeCompare(b.text))
  ], [isTestnetEnabled, metadataChains, t]);

  return hashes;
}
