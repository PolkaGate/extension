// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { useMemo } from 'react';

import { BN } from '@polkadot/util';

import { curveThreshold } from '../popup/governance/Curves';

const MIN_APPROVAL = 50;

export default function useCurrentApprovalThreshold(track: PalletReferendaTrackInfo | undefined, block: number | undefined): number | undefined {
  const approval = useMemo(() => {
    if (!track || !block) {
      return undefined;
    }

    const { decisionPeriod, minApproval } = track;
    const threshold = curveThreshold(minApproval, new BN(block), decisionPeriod).divn(10000000).toNumber();

    return threshold < MIN_APPROVAL ? MIN_APPROVAL : threshold;
  }, [block, track]);

  return approval;
}
