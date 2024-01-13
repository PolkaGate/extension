// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect } from 'react';

import { ActionContext } from '../components';
import useChain from './useChain';

export default function useUnSupportedNetwork(address: string | undefined, supportedChains: string[] | undefined, cbFunction?: () => void): void {
  const chain = useChain(address);
  const onAction = useContext(ActionContext);

  useEffect(() => {
    if (!address || !supportedChains || supportedChains.length === 0 || !chain || !chain.genesisHash || supportedChains.includes(chain.genesisHash)) {
      return;
    }

    if (!(supportedChains.includes(chain.genesisHash))) {
      return cbFunction ? cbFunction() : onAction('/');
    }
  }, [address, cbFunction, chain, onAction, supportedChains]);
}
