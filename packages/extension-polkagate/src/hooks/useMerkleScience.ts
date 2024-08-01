// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { MsData } from '../util/getMS';

import { useEffect, useState } from 'react';

import { POLKADOT_GENESIS_HASH } from '../util/constants';
import { getJsonFileFromRepo } from '../util/getMS';

export default function useMerkleScience(address: string | AccountId | null | undefined, chain: Chain | null | undefined, initialize?: boolean): MsData | undefined {
  const [data, setData] = useState<MsData>();

  useEffect(() => {
    if (!address || chain?.genesisHash !== POLKADOT_GENESIS_HASH) {
      return;
    }

    browser.storage.local.get('merkleScience').then((res) => {
      const data = res?.['merkleScience'] as MsData[];
      const found = data?.find((d) => d.address?.toLowerCase() === String(address).toLowerCase());

      setData(found);
    }).catch(console.error);
  }, [address, chain]);

  useEffect(() => {
    initialize && getJsonFileFromRepo().then((data) => {
      if (data) {
        // eslint-disable-next-line no-void
        void browser.storage.local.set({ merkleScience: data });
        console.log('Merkle Science data is loaded!');
      }
    }).catch(console.error);
  }, [initialize]);

  return data;
}
