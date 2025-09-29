// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import type { JsonRpcSigner } from 'ethers';

import { Wallet } from "ethers";
import { useEffect, useMemo, useState } from 'react';

import { getEthProvider } from '../util/getEthProvider';
import useChainInfo from './useChainInfo';

export default function useEthSigner (address: string | undefined, genesisHash: string | null | undefined): JsonRpcSigner | undefined {
  const { chainName } = useChainInfo(genesisHash, true);

  const [signer, setSigner] = useState<JsonRpcSigner>();

  // const provider = useMemo(() => {
  //   if (!chainName || !address) {
  //     return;
  //   }

  //   console.log(chainName);

  //   const _provider = getEthProvider(chainName, true);

  //   console.log('_provider:', _provider);

  //   return _provider;
  // }, [address, chainName]);

  // useEffect(() => {
  //   if (!chainName || !address || signer || !provider) {
  //     return;
  //   }

  //   if (!(provider && 'getSigner' in provider && typeof provider.getSigner === 'function')) {
  //     return;
  //   }

  //    console.log('Getting signer ...', address);
  //   provider.getSigner(address).then((s) => {
  //     setSigner(s);
  //   }).catch(console.error);

  //   console.log('signer:', signer);
  // }, [address, chainName, provider, signer]);

  return signer;
}
