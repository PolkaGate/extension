// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { useMemo } from 'react';

import { BN_MAX_INTEGER } from '@polkadot/util';

import useAccountLocks from './useAccountLocks';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useHasDelegated from './useHasDelegated';
import useTimeToUnlock from './useTimeToUnlock';

export interface Lock {
  classId: BN;
  endBlock: BN;
  locked: string;
  refId: BN | 'N/A';
  total: BN;
}

interface OutputType {
  classToUnlock: Lock[] | undefined;
  delegatedBalance: BN | null | undefined;
  hasDescription: boolean;
  isDisable: boolean;
  lockedInRef: BN | undefined
  timeToUnlock: string | null | undefined;
  totalLocked: BN | null | undefined;
  unlockDate: string | null | undefined;
  unlockableAmount: BN | undefined;
}

export default function useLockedInReferenda (address: string | undefined, genesisHash: string | null | undefined, refreshNeeded: boolean | undefined): OutputType {
  const delegatedBalance = useHasDelegated(address, genesisHash, refreshNeeded);
  const referendaLocks = useAccountLocks(address, genesisHash, 'referenda', 'convictionVoting', false, refreshNeeded);
  const currentBlock = useCurrentBlockNumber(genesisHash);
  const { lockedInRef, timeToUnlock, totalLocked, unlockDate, unlockableAmount } = useTimeToUnlock(address, genesisHash, delegatedBalance, referendaLocks, refreshNeeded);

  const classToUnlock = currentBlock ? referendaLocks?.filter((ref) => ref.endBlock.ltn(currentBlock) && ref.classId.lt(BN_MAX_INTEGER)) : undefined;
  const isDisable = useMemo(() => !unlockableAmount || unlockableAmount.isZero() || !classToUnlock || !totalLocked, [classToUnlock, totalLocked, unlockableAmount]);

  const hasDescription = useMemo(() =>
    Boolean((unlockableAmount && !unlockableAmount.isZero()) || (delegatedBalance && !delegatedBalance.isZero()) || timeToUnlock)
    , [delegatedBalance, timeToUnlock, unlockableAmount]);

  return {
    classToUnlock,
    delegatedBalance,
    hasDescription,
    isDisable,
    lockedInRef,
    timeToUnlock,
    totalLocked,
    unlockDate,
    unlockableAmount
  };
}
