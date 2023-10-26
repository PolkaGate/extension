// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

import useChain from './useChain';

export default function useUnSupportedNetwork (address: string | undefined, supportedChains: string[] | undefined, cbFunction: () => void): void {
  const chain = useChain(address);

  useEffect(() => {
    if (!address || !supportedChains || supportedChains.length === 0 || !chain || !chain.genesisHash || supportedChains.includes(chain.genesisHash)) {
      return;
    }

    if (!(supportedChains.includes(chain.genesisHash))) {
      return cbFunction();
    }
  }, [address, cbFunction, chain, supportedChains]);
}
