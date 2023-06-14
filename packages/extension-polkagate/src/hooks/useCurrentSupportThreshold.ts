// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { useMemo } from 'react';

import { BN } from '@polkadot/util';

import { curveThreshold } from '../popup/governance/Curves';

const MIN_SUPPORT = 0;

export default function useCurrentSupportThreshold(track: PalletReferendaTrackInfo | undefined, block: number | undefined): number | undefined {
  const support = useMemo(() => {
    if (!track || !block) {
      return undefined;
    }

    const { decisionPeriod, minSupport } = track;

    const threshold = curveThreshold(minSupport, new BN(block), decisionPeriod).toNumber() / 10000000;

    return threshold < MIN_SUPPORT ? MIN_SUPPORT : threshold;
  }, [block, track]);

  return support;
}
