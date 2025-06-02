// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { getParaId, hasSupportForAsset, NODE_NAMES } from '@paraspell/sdk';

export function getSupportedDestinations (sourceChain: typeof NODE_NAMES, assetSymbol: string): DropdownOption {
  const destinationChains = [];

  for (const chain of NODE_NAMES) {
    if (chain !== sourceChain) {
      const isSupported = hasSupportForAsset(chain, assetSymbol);

      if (isSupported) {
        destinationChains.push({ text: chain, value: getParaId(chain) });
      }
    }
  }

  console.log('Possible destination chains:', destinationChains);

  return destinationChains;
}
