// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import chains from './chains';

export default function getNetworkMap(): Map<string, string> {
  const res = new Map<string, string>();

  chains.forEach((chain) => {
    res.set(chain.genesisHash, chain.chain);
  });

  return res;
}
