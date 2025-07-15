// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { useContext, useEffect, useState } from 'react';

import { SelectedContext } from '../components';

export default function useAccountSelectedChain (address: string | undefined): HexString | undefined | null {
  const [genesisHash, setGenesisHash] = useState<HexString | null>();

  const { selected: { chains } } = useContext(SelectedContext);

  useEffect(() => {
    if (!address || !chains) {
      return;
    }

    setGenesisHash(chains?.[address] as HexString | undefined ?? POLKADOT_GENESIS);
  }, [address, chains]);

  return genesisHash;
}
