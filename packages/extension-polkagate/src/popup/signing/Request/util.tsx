// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { hexToU8a, isHex } from '@polkadot/util';

export function decodeCallIndex (chain: Chain | null | undefined, val: string) {
  try {
    if (!chain || !isHex(val)) {
      return val;
    }

    const call = chain.registry.findMetaCall(hexToU8a(val));

    return `${call.section} → ${call.method}`;
  } catch {
    return val;
  }
}
