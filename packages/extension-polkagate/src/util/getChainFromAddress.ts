// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import allChains, { type NetworkInfo } from '@polkadot/extension-polkagate/src/util/chains';
import { checkAddress } from '@polkadot/util-crypto';

export function getChainFromAddress(address: string | undefined): NetworkInfo | null {
    if (!address) {
        return null;
    }

    return allChains.find(({ ss58Format }) => checkAddress(address, ss58Format)[0]) || null;
}
