// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-ignore
import type { PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { useCallback, useEffect, useState } from 'react';

import { BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import blockToDate from '../popup/crowdloans/partials/blockToDate';
import { type Lock } from './useAccountLocks';
import { useCurrentBlockNumber, useInfo, useTranslation } from '.';

export default function useTimeToUnlock(address: string | undefined, delegatedBalance: BN | null | undefined, referendaLocks: Lock[] | null | undefined, refresh?: boolean) {
  const { t } = useTranslation();
  const { api, chain, formatted } = useInfo(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [unlockableAmount, setUnlockableAmount] = useState<BN>();
  const [lockedInRef, setLockedInReferenda] = useState<BN>();
  const [totalLocked, setTotalLocked] = useState<BN | null>();
  const [timeToUnlock, setTimeToUnlock] = useState<string | null>();
  const [miscRefLock, setMiscRefLock] = useState<BN>();

  const biggestOngoingLock = useCallback((sortedLocks: Lock[]) => {
    const maybeFound = sortedLocks.find(({ endBlock }) => endBlock.eq(BN_MAX_INTEGER));

    return maybeFound ? maybeFound.total : BN_ZERO;
  }, []);

  // Reset states when address changes
  useEffect(() => {
    setUnlockableAmount(undefined);
    setLockedInReferenda(undefined);
    setTotalLocked(undefined);
    setTimeToUnlock(undefined);
    setMiscRefLock(undefined);
  }, [address]);

  useEffect(() => {
    if (refresh) {
      setLockedInReferenda(undefined); // TODO: needs double check
      setUnlockableAmount(undefined);
      setTotalLocked(undefined);
      setMiscRefLock(undefined);
    }
  }, [refresh]);

  useEffect(() => {
    if (referendaLocks === null) {
      setLockedInReferenda(BN_ZERO);
      setUnlockableAmount(BN_ZERO);
      setTotalLocked(BN_ZERO);
      setTimeToUnlock(null);

      return;
    }

    if (!referendaLocks || !currentBlock) {
      setLockedInReferenda(undefined);
      setUnlockableAmount(undefined);
      setTotalLocked(undefined);
      setTimeToUnlock(undefined);

      return;
    }

    if (!referendaLocks?.length) {
      setLockedInReferenda(undefined);
      setTimeToUnlock(t('Unlock date unknown'));

      return;
    }

    referendaLocks.sort((a, b) => { // sort locks based on total and endblock desc
      if (a.total.gt(b.total)) {
        return -1;
      }

      if (a.total.lt(b.total)) {
        return 1;
      }

      if (a.endBlock.gt(b.endBlock)) {
        return -1;
      }

      if (a.endBlock.lt(b.endBlock)) {
        return 1;
      }

      return 0;
    });

    const biggestVote = referendaLocks[0].total;

    setLockedInReferenda(biggestVote);
    const indexOfBiggestNotLockable = referendaLocks.findIndex(({ endBlock }) => endBlock.gtn(currentBlock));

    if (indexOfBiggestNotLockable === -1) { // all is unlockable
      return setUnlockableAmount(biggestVote);
    }

    if (biggestVote.eq(biggestOngoingLock(referendaLocks))) { // The biggest vote is already ongoing
      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock(t('Locked in ongoing referenda'));
    }

    if (indexOfBiggestNotLockable === 0 || biggestVote.eq(referendaLocks[indexOfBiggestNotLockable].total)) { // nothing is unlockable
      const dateOptions = { day: 'numeric', hour: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions;
      const dateString = blockToDate(Number(referendaLocks[indexOfBiggestNotLockable].endBlock), currentBlock, dateOptions);

      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock(t('Unlockable on {{dateString}}', { replace: { dateString } }));
    }

    const amountStillLocked = referendaLocks[indexOfBiggestNotLockable].total;

    setUnlockableAmount(biggestVote.sub(amountStillLocked));
  }, [api, biggestOngoingLock, currentBlock, referendaLocks, t]);

  useEffect(() => {
    if (!api?.query?.['balances'] || !formatted || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return setMiscRefLock(undefined);
    }

    api.query['balances']['locks'](formatted)
      .then((locks) => {
        const _locks = locks as unknown as PalletBalancesBalanceLock[];

        if (_locks?.length) {
          const foundRefLock = _locks.find((l) => l.id.toHuman() === 'pyconvot');

          setMiscRefLock(foundRefLock?.amount);
        }
      })
      .catch(console.error);
  }, [api, chain?.genesisHash, formatted, refresh]);

  useEffect(() => {
    if (!lockedInRef && !delegatedBalance && !miscRefLock) {
      return setTotalLocked(undefined);
    }

    setTotalLocked(miscRefLock || lockedInRef || delegatedBalance);
  }, [delegatedBalance, lockedInRef, miscRefLock]);

  return {
    lockedInRef,
    timeToUnlock,
    totalLocked,
    unlockableAmount
  };
}
