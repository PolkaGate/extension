// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account locked tokens information
 * */

import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { noop } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_MAX_INTEGER } from '@polkadot/util';

import { FormatPrice, ShowBalance, ShowValue } from '../../../components';
import { useAccountLocks, useCurrentBlockNumber, useHasDelegated, useInfo, useTimeToUnlock, useTokenPrice, useTranslation } from '../../../hooks';
import { TIME_TO_SHAKE_ICON } from '../../../util/constants';
import Review from './Review';

interface Props {
  address: string | undefined;
  refresh: boolean | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LockedInReferenda ({ address, refresh, setRefresh }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, decimal, token } = useInfo(address);
  const { price } = useTokenPrice(address);
  const delegatedBalance = useHasDelegated(address, refresh);
  const referendaLocks = useAccountLocks(address, 'referenda', 'convictionVoting', false, refresh);
  const { lockedInRef, timeToUnlock, totalLocked, unlockableAmount } = useTimeToUnlock(address, referendaLocks, refresh);
  const currentBlock = useCurrentBlockNumber(address);

  const [showReview, setShowReview] = useState(false);
  const [shake, setShake] = useState<boolean>();

  const classToUnlock = currentBlock ? referendaLocks?.filter((ref) => ref.endBlock.ltn(currentBlock) && ref.classId.lt(BN_MAX_INTEGER)) : undefined;

  useEffect(() => {
    if (unlockableAmount && !unlockableAmount.isZero()) {
      setShake(true);
      setTimeout(() => setShake(false), TIME_TO_SHAKE_ICON);
    }
  }, [unlockableAmount]);

  const onUnlock = useCallback(() => {
    setShowReview(true);
  }, []);

  return (
    <>
      <Grid item pt='3px' pb='2px'>
        <Grid alignItems='flex-end' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300 }} xs>
            {t('Locked in Referenda')}
          </Grid>
          <Grid alignItems='flex-end' container direction='column' item sx={{ width: 'fit-content' }}>
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
                price={price}
              />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' sx={{ cursor: unlockableAmount && !unlockableAmount.isZero() ? 'pointer' : undefined, ml: '8px', width: '26px' }}>
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
                ? t('{{amount}} can be unlocked', { replace: { amount: api.createType('Balance', unlockableAmount).toHuman() } })
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
