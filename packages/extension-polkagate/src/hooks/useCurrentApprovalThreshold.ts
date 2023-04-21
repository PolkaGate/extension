// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { useMemo } from 'react';

import { BN } from '@polkadot/util';

import { curveThreshold } from '../popup/governance/Chart';

export default function useCurrentApprovalThreshold(track: PalletReferendaTrackInfo | undefined, block: number | undefined): number | undefined {
  const support = useMemo(() => {
    if (!track || !block) {
      return undefined;
    }

    const { decisionPeriod, minApproval } = track;

    return curveThreshold(minApproval, new BN(block), decisionPeriod).divn(10000000).toNumber();
  }, [block, track]);

  return support;
}
