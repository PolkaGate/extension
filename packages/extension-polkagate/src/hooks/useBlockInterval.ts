// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useMemo } from 'react';

import { BN, BN_THOUSAND, BN_TWO, bnMin } from '@polkadot/util';

import useApi from './useApi';

export const A_DAY = new BN(24 * 60 * 60 * 1000);

// Some chains incorrectly use these, i.e. it is set to values such as 0 or even 2
// Use a low minimum validity threshold to check these against
const THRESHOLD = BN_THOUSAND.div(BN_TWO);
const DEFAULT_TIME = new BN(6_000);

function calcInterval(api: ApiPromise): BN {
    return bnMin(A_DAY, (
        // Babe, e.g. Relay chains (Substrate defaults)
        api.consts.babe?.expectedBlockTime ||
        // POW, eg. Kulupu
        api.consts.difficulty?.targetBlockTime ||
        // Subspace
        api.consts.subspace?.expectedBlockTime || (
            // Check against threshold to determine value validity
            api.consts.timestamp?.minimumPeriod.gte(THRESHOLD)
                // Default minimum period config
                ? api.consts.timestamp.minimumPeriod.mul(BN_TWO)
                : api.query.parachainSystem
                    // default guess for a parachain
                    ? DEFAULT_TIME.mul(BN_TWO)
                    // default guess for others
                    : DEFAULT_TIME
        )
    ));
}

export default function useBlockInterval(address: string|undefined): BN | undefined {
    const api = useApi(address);

    return useMemo(() => api && calcInterval(api), [api]);
}
