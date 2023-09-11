// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account locked tokens information
 * */

import type { PalletBalancesBalanceLock } from '@polkadot/types/lookup';

import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { BN, BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import { FormatPrice, ShowBalance, ShowValue } from '../../../components';
import { useAccountLocks, useApi, useChain, useCurrentBlockNumber, useDecimal, useFormatted, useHasDelegated, usePrice, useToken, useTranslation } from '../../../hooks';
import { Lock } from '../../../hooks/useAccountLocks';
import { TIME_TO_SHAKE_ICON } from '../../../util/constants';
import blockToDate from '../../crowdloans/partials/blockToDate';
import Review from './Review';

interface Props {
  address: string | undefined;
  refresh: boolean | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setPageLoading: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const noop = () => null;

export default function LockedInReferenda({ address, refresh, setPageLoading, setRefresh }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const price = usePrice(address);
  const formatted = useFormatted(address);
  const decimal = useDecimal(address);
  const chain = useChain(address);
  const token = useToken(address);
  const delegatedBalance = useHasDelegated(address, refresh);
  const referendaLocks = useAccountLocks(address, 'referenda', 'convictionVoting', false, refresh);
  const currentBlock = useCurrentBlockNumber(address);

  const [showReview, setShowReview] = useState(false);
  const [unlockableAmount, setUnlockableAmount] = useState<BN>();
  const [lockedInRef, setLockedInReferenda] = useState<BN>();
  const [totalLocked, setTotalLocked] = useState<BN | null>();
  const [timeToUnlock, setTimeToUnlock] = useState<string | null>();
  const [miscRefLock, setMiscRefLock] = useState<BN>();
  const [shake, setShake] = useState<boolean>();

  const classToUnlock = currentBlock ? referendaLocks?.filter((ref) => ref.endBlock.ltn(currentBlock) && ref.classId.lt(BN_MAX_INTEGER)) : undefined;

  useEffect(() => {
    if (unlockableAmount && !unlockableAmount.isZero()) {
      setShake(true);
      setTimeout(() => setShake(false), TIME_TO_SHAKE_ICON);
    }
  }, [unlockableAmount]);

  const biggestOngoingLock = useCallback((sortedLocks: Lock[]) => {
    const maybeFound = sortedLocks.find(({ endBlock }) => endBlock.eq(BN_MAX_INTEGER));

    return maybeFound ? maybeFound.total : BN_ZERO;
  }, []);

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
      setTimeToUnlock(null);

      return;
    }

    if (!referendaLocks?.length || !currentBlock) {
      setLockedInReferenda(undefined);
      setTimeToUnlock(undefined);

      return;
    }

    referendaLocks.sort((a, b) => b.total.sub(a.total).toNumber());
    const biggestVote = referendaLocks[0].total;

    setLockedInReferenda(biggestVote);
    const indexOfBiggestNotLockable = referendaLocks.findIndex((l) => l.endBlock.gtn(currentBlock));

    if (indexOfBiggestNotLockable === -1) { // all is unlockable
      return setUnlockableAmount(biggestVote);
    }

    if (biggestVote.eq(biggestOngoingLock(referendaLocks))) { // The biggest vote is already ongoing
      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock('Locked in ongoing referenda');
    }

    if (indexOfBiggestNotLockable === 0 || biggestVote.eq(referendaLocks[indexOfBiggestNotLockable].total)) { // nothing is unlockable
      const dateString = blockToDate(Number(referendaLocks[indexOfBiggestNotLockable].endBlock), currentBlock);

      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock(`Unlockable on ${dateString}`);
    }

    const amountStillLocked = referendaLocks[indexOfBiggestNotLockable].total;

    setUnlockableAmount(biggestVote.sub(amountStillLocked));
  }, [api, biggestOngoingLock, currentBlock, referendaLocks]);

  useEffect(() => {
    if (!api?.query?.balances || !formatted || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return setMiscRefLock(undefined);
    }

    // eslint-disable-next-line no-void
    void api.query.balances.locks(formatted).then((locks: PalletBalancesBalanceLock[]) => {
      if (locks?.length) {
        const foundRefLock = locks.find((l) => l.id.toHuman() === 'pyconvot');

        setMiscRefLock(foundRefLock?.amount);
      }
    });
  }, [api, chain?.genesisHash, formatted, refresh]);

  useEffect(() => {
    if (!lockedInRef && !delegatedBalance && !miscRefLock) {
      return setTotalLocked(undefined);
    }

    setTotalLocked(miscRefLock || lockedInRef || delegatedBalance);
  }, [delegatedBalance, lockedInRef, miscRefLock]);

  useEffect(() => {
    setPageLoading(
      !(
        (unlockableAmount && !unlockableAmount.isZero()) ||
        (delegatedBalance && !delegatedBalance.isZero()) ||
        timeToUnlock !== undefined
      )
    );
  }, [delegatedBalance, lockedInRef, miscRefLock, setPageLoading, timeToUnlock, unlockableAmount]);

  const onUnlock = useCallback(() => {
    setShowReview(true);
  }, []);

  return (
    <>
      <Grid item pt='3px' pb='2px'>
        <Grid alignItems='flex-end' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300 }} xs={5.2}>
            {t('Locked in Referenda')}
          </Grid>
          <Grid alignItems='flex-end' container direction='column' item xs>
            <Grid item sx={{ fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} textAlign='right'>
              <ShowBalance
                api={api}
                balance={totalLocked}
                decimal={decimal}
                decimalPoint={2}
                token={token}
                withCurrency={false}
              />
            </Grid>
            <Grid item pt='6px' sx={{ lineHeight: '15px' }}>
              <FormatPrice
                amount={totalLocked}
                decimals={decimal}
                price={price?.amount}
              />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' sx={{ cursor: unlockableAmount && !unlockableAmount.isZero() && 'pointer', ml: '8px', width: '26px' }}>
            <FontAwesomeIcon
              color={!unlockableAmount || unlockableAmount.isZero() ? theme.palette.action.disabledBackground : theme.palette.secondary.light}
              icon={faUnlockAlt}
              onClick={unlockableAmount && !unlockableAmount.isZero() ? onUnlock : noop}
              shake={shake}
              style={{ height: '25px' }}
            />
          </Grid>
          <Grid container item justifyContent='flex-end' pt='6px' sx={{ fontSize: '12px', lineHeight: '15px', mr: '33px' }}>
            <ShowValue
              height={15}
              value={api && unlockableAmount && !unlockableAmount.isZero()
                ? `${api.createType('Balance', unlockableAmount).toHuman()} can be unlocked`
                : delegatedBalance && !delegatedBalance.isZero()
                  ? t('Locked as delegated')
                  : timeToUnlock === null ? '' : timeToUnlock}
              width='50%'
            />
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '5px' }} />
      {showReview && !!classToUnlock?.length && api && lockedInRef && unlockableAmount && address &&
        <Review
          address={address}
          api={api}
          classToUnlock={classToUnlock}
          setRefresh={setRefresh}
          setShow={setShowReview}
          show={showReview}
          totalLocked={lockedInRef}
          unlockableAmount={unlockableAmount}
        />
      }
    </>
  );
}
