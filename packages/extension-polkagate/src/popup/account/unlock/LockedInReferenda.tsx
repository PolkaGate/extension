// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import type { PalletBalancesBalanceLock, PalletConvictionVotingVoteCasting, PalletConvictionVotingVoteVoting, PalletReferendaReferendumInfoConvictionVotingTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';

import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Skeleton, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import { Infotip, ShowBalance } from '../../../components';
import { useAccountLocks, useApi, useBalances, useCurrentBlockNumber, useDecimal, useFormatted, useHasDelegated, usePrice, useToken, useTranslation } from '../../../hooks';
import { Lock } from '../../../hooks/useAccountLocks';
import blockToDate from '../../crowdloans/partials/blockToDate';
import Review from './Review';

interface Props {
  address: string | undefined;
}

export default function LockedInReferenda({ address }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const price = usePrice(address);
  const formatted = useFormatted(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const delegatedBalance = useHasDelegated(address);
  const referendaLocks = useAccountLocks(address, 'referenda', 'convictionVoting');
  const currentBlock = useCurrentBlockNumber(address);
  const balances = useBalances(address);

  const [showReview, setShowReview] = useState(false);
  const [unlockableAmount, setUnlockableAmount] = useState<BN>();
  const [lockedInRef, setLockedInReferenda] = useState<BN>();
  const [totalLocked, setTotalLocked] = useState<BN | null>();
  const [timeToUnlock, setTimeToUnlock] = useState<string>();
  const [miscRefLock, setMiscRefLock] = useState<BN>();

  const balanceInUSD = useMemo(() => price && decimal && totalLocked && Number(totalLocked) / (10 ** decimal) * price.amount, [decimal, price, totalLocked]);
  const refsToUnlock = currentBlock ? referendaLocks?.filter((ref) => ref.endBlock.ltn(currentBlock)) : undefined;

  const biggestOngoingLock = useCallback((sortedLocks: Lock[]) => {
    const maybeFound = sortedLocks.find(({ endBlock }) => endBlock.eq(BN_MAX_INTEGER));

    return maybeFound ? maybeFound.total : BN_ZERO;
  }, []);

  useEffect(() => {
    if (!referendaLocks?.length || !currentBlock) {
      setLockedInReferenda(undefined);
      setTimeToUnlock(undefined);

      return;
    }

    referendaLocks.sort((a, b) => b.total.sub(a.total).toNumber());
    const biggestVote = referendaLocks[0].total;

    setLockedInReferenda(biggestVote);
    const indexOfBiggestNotLockable = referendaLocks.findIndex((l) => l.endBlock.gtn(currentBlock));

    console.log('indexOfBiggestNotLockable:', referendaLocks[indexOfBiggestNotLockable]?.endBlock?.toString());
    console.log('referendaLocks:', referendaLocks);
    console.log('currentBlock:', currentBlock);
    console.log('endblock:', referendaLocks?.map(({ endBlock }) => endBlock.toNumber()));
    api && console.log('totals:', referendaLocks?.map(({ total }) => api.createType('Balance', total).toHuman()));

    if (indexOfBiggestNotLockable === -1) { // all is unlockable
      return setUnlockableAmount(biggestVote);
    }

    if (biggestVote.eq(biggestOngoingLock(referendaLocks))) { // The biggest vote is already ongoing 
      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock('Locked in ongoing referenda.');
    }

    if (indexOfBiggestNotLockable === 0 || biggestVote.eq(referendaLocks[indexOfBiggestNotLockable].total)) { // nothing is unlockable
      const dateString = blockToDate(Number(referendaLocks[indexOfBiggestNotLockable].endBlock), currentBlock);

      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock(`Unlockable at ${dateString}`);
    }

    const amountStillLocked = referendaLocks[indexOfBiggestNotLockable].total;

    setUnlockableAmount(biggestVote.sub(amountStillLocked));
  }, [api, biggestOngoingLock, currentBlock, referendaLocks]);

  useEffect(() => {
    if (!api?.query?.balances || !formatted) {
      return;
    }

    // eslint-disable-next-line no-void
    void api.query.balances.locks(formatted).then((locks: PalletBalancesBalanceLock[]) => {
      if (locks?.length) {
        const foundRefLock = locks.find((l) => l.id.toHuman() === 'pyconvot');

        setMiscRefLock(foundRefLock?.amount);
      }
    });
  }, [api, formatted]);

  useEffect(() => {
    if (!lockedInRef && !delegatedBalance && !miscRefLock) {
      return;
    }

    setTotalLocked(miscRefLock || lockedInRef || delegatedBalance);
  }, [delegatedBalance, lockedInRef, miscRefLock]);

  return (
    <>
      <Grid item py='4px'>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, lineHeight: '36px' }} xs={6}>
            {t('Locked in Referenda')}
          </Grid>
          <Grid alignItems='flex-end' container direction='column' item xs>
            <Grid item sx={{ fontSize: '20px', fontWeight: 400, lineHeight: '20px' }} textAlign='right'>
              <ShowBalance api={api} balance={totalLocked} decimal={decimal} decimalPoint={2} token={token} />
            </Grid>
            <Grid item pt='6px' sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '15px' }} textAlign='right'>
              {balanceInUSD !== undefined
                ? `$${Number(balanceInUSD)?.toLocaleString()}`
                : <Skeleton height={15} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '90px' }} />
              }
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' xs={1.2} sx={{ cursor: unlockableAmount && !unlockableAmount.isZero() && 'pointer' }}>
            <Infotip
              text={api && unlockableAmount && !unlockableAmount.isZero()
                ? `${api.createType('Balance', unlockableAmount).toHuman()} can be unlocked`
                : delegatedBalance && !delegatedBalance.isZero()
                  ? t('Locked as delegated')
                  : timeToUnlock}
            >
              <FontAwesomeIcon
                color={!unlockableAmount || unlockableAmount.isZero() ? theme.palette.action.disabledBackground : theme.palette.secondary.light}
                icon={faUnlockAlt}
                style={{ height: '25px' }}
                onClick={(unlockableAmount && !unlockableAmount.isZero()) ? () => setShowReview(true) : () => null}
              />
            </Infotip>
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '5px' }} />
      {showReview && refsToUnlock?.length && api && lockedInRef && unlockableAmount &&
        <Review
          address={address}
          api={api}
          refsToUnlock={refsToUnlock}
          setShow={setShowReview}
          show={showReview}
          totalLocked={lockedInRef}
          unlockableAmount={unlockableAmount}
        />
      }
    </>
  );
}
