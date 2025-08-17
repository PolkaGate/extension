// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { useMemo } from 'react';

import { BN_MAX_INTEGER } from '@polkadot/util';

import { useAccountLocks2, useCurrentBlockNumber2, useHasDelegated2, useTimeToUnlock2 } from '.';

interface Lock {
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
  unlockableAmount: BN | undefined;
}

export default function useLockedInReferenda (address: string | undefined, genesisHash: string | null | undefined, refreshNeeded: boolean | undefined): OutputType {
  const delegatedBalance = useHasDelegated2(address, genesisHash, refreshNeeded);
  const referendaLocks = useAccountLocks2(address, genesisHash, 'referenda', 'convictionVoting', false, refreshNeeded);
  const currentBlock = useCurrentBlockNumber2(genesisHash);
  const { lockedInRef, timeToUnlock, totalLocked, unlockableAmount } = useTimeToUnlock2(address, genesisHash, delegatedBalance, referendaLocks, refreshNeeded);

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
    unlockableAmount
  };
}
