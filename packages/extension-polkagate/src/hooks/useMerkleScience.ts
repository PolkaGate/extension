// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { POLKADOT_GENESIS_HASH } from '../util/constants';
import { getJsonFileFromRepo, MsData } from '../util/getMS';

export default function useMerkleScience(address: string | AccountId | null | undefined, chain: Chain | undefined): MsData | undefined {
  const [data, setData] = useState<MsData>();

  useEffect(() => {
    if (!address || chain?.genesisHash !== POLKADOT_GENESIS_HASH) {
      return;
    }

    chrome.storage.local.get('merkleScience', (res) => {
      const data = res?.merkleScience as MsData[];
      // console.log('data:', data.find((i)=>i.tag_type_verbose==='Scam'))
      const found = data?.find((d) => d.address === address);

      setData(found);
    });
  }, [address, chain]);

  useEffect(() => {
    getJsonFileFromRepo().then((data) => {
      if (data) {
        // eslint-disable-next-line no-void
        void chrome.storage.local.set({ merkleScience: data });
      }
    }).catch(console.error);
  }, []);

  return data;
}
