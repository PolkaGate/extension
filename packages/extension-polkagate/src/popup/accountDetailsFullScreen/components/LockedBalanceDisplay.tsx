// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletBalancesBalanceLock } from '@polkadot/types/lookup';

import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import { FormatPrice, ShowBalance } from '../../../components';
import { useAccountLocks, useCurrentBlockNumber, useHasDelegated, useTranslation } from '../../../hooks';
import { Lock } from '../../../hooks/useAccountLocks';
import { TIME_TO_SHAKE_ICON } from '../../../util/constants';
import blockToDate from '../../crowdloans/partials/blockToDate';
import { popupNumbers, UnlockInformationType } from '..';

interface DisplayBalanceProps {
  address: string | undefined;
  formatted: string | undefined;
  chain: Chain | null | undefined;
  api: ApiPromise | undefined;
  title: string;
  token: string | undefined;
  decimal: number | undefined;
  price: number | undefined;
  isDarkTheme: boolean;
  refreshNeeded?: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
  setUnlockInformation: React.Dispatch<React.SetStateAction<UnlockInformationType | undefined>>;
}

export default function LockedBalanceDisplay ({ address, api, chain, decimal, formatted, isDarkTheme, price, refreshNeeded, setDisplayPopup, setUnlockInformation, title, token }: DisplayBalanceProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const delegatedBalance = useHasDelegated(address, refreshNeeded);
  const referendaLocks = useAccountLocks(address, 'referenda', 'convictionVoting', false, refreshNeeded);
  const currentBlock = useCurrentBlockNumber(address);

  // const [showReview, setShowReview] = useState(false);
  const [unlockableAmount, setUnlockableAmount] = useState<BN>();
  const [lockedInRef, setLockedInReferenda] = useState<BN>();
  const [totalLocked, setTotalLocked] = useState<BN | null>();
  const [timeToUnlock, setTimeToUnlock] = useState<string | null>();
  const [miscRefLock, setMiscRefLock] = useState<BN>();
  const [shake, setShake] = useState<boolean>();

  const classToUnlock = currentBlock ? referendaLocks?.filter((ref) => ref.endBlock.ltn(currentBlock) && ref.classId.lt(BN_MAX_INTEGER)) : undefined;
  const isDisable = useMemo(() => !unlockableAmount || unlockableAmount.isZero() || !classToUnlock || !totalLocked, [classToUnlock, totalLocked, unlockableAmount]);

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
    if (refreshNeeded) {
      setLockedInReferenda(undefined); // TODO: needs double check
      setUnlockableAmount(undefined);
      setTotalLocked(undefined);
      setMiscRefLock(undefined);
    }
  }, [refreshNeeded]);

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
      const dateString = blockToDate(Number(referendaLocks[indexOfBiggestNotLockable].endBlock), currentBlock);

      setUnlockableAmount(BN_ZERO);

      return setTimeToUnlock(t('Unlockable on {{dateString}}', { replace: { dateString } }));
    }

    const amountStillLocked = referendaLocks[indexOfBiggestNotLockable].total;

    setUnlockableAmount(biggestVote.sub(amountStillLocked));
  }, [api, biggestOngoingLock, currentBlock, referendaLocks, t]);

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
  }, [api, chain?.genesisHash, formatted, refreshNeeded]);

  useEffect(() => {
    if (!lockedInRef && !delegatedBalance && !miscRefLock) {
      return setTotalLocked(undefined);
    }

    setTotalLocked(miscRefLock || lockedInRef || delegatedBalance);
  }, [delegatedBalance, lockedInRef, miscRefLock]);

  const onUnlock = useCallback(() => {
    if (isDisable) {
      return;
    }

    setUnlockInformation({
      classToUnlock,
      totalLocked,
      unlockableAmount
    });
    setDisplayPopup(popupNumbers.LOCKED_IN_REFERENDA);
  }, [classToUnlock, isDisable, setDisplayPopup, setUnlockInformation, totalLocked, unlockableAmount]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: '85px', p: '15px 40px' }}>
      <Typography fontSize='18px' fontWeight={400}>
        {title}
      </Typography>
      <Grid alignItems='center' container item width='fit-content'>
        <Grid alignItems='flex-end' container direction='column' item width='fit-content'>
          <Grid alignItems='center' container item width='fit-content'>
            <Grid item sx={{ fontSize: '22px', fontWeight: 600, m: 'auto' }}>
              <ShowBalance
                balance={totalLocked}
                decimal={decimal}
                decimalPoint={2}
                token={token}
                withCurrency={false}
              />
            </Grid>
            <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '35px', mx: '10px', my: 'auto' }} />
            <Grid item sx={{ '> div span': { display: 'block' }, fontSize: '22px', fontWeight: 400 }}>
              <FormatPrice
                amount={totalLocked}
                decimals={decimal}
                price={price}
              />
            </Grid>
          </Grid>
          <Typography fontSize='12px' fontWeight={500} textAlign='right'>
            {api && unlockableAmount && !unlockableAmount.isZero()
              ? `${api.createType('Balance', unlockableAmount).toHuman()} can be unlocked`
              : delegatedBalance && !delegatedBalance.isZero()
                ? t('Locked as delegated')
                : timeToUnlock === null ? '' : timeToUnlock}
          </Typography>
        </Grid>
        <Grid item m='auto' pl='8px'>
          <IconButton
            disabled={isDisable}
            onClick={onUnlock}
            sx={{ p: '8px' }}
          >
            <FontAwesomeIcon
              color={isDisable ? theme.palette.action.disabledBackground : theme.palette.secondary.light}
              icon={faUnlockAlt}
              shake={shake}
              style={{ height: '25px' }}
            />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
