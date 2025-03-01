// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account locked tokens information
 * */

import { faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { noop } from '@polkadot/extension-polkagate/src/util/utils';

import { FormatPrice, ShowBalance, ShowValue } from '../../../components';
import { useInfo, useLockedInReferenda, useTokenPrice, useTranslation } from '../../../hooks';
import { TIME_TO_SHAKE_ICON } from '../../../util/constants';
import Review from './Review';

interface Props {
  address: string | undefined;
  refresh: boolean | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LockedInReferenda({ address, refresh, setRefresh }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, decimal, token } = useInfo(address);
  const { price } = useTokenPrice(address);

  const [showReview, setShowReview] = useState(false);
  const [shake, setShake] = useState<boolean>();

  const { classToUnlock, delegatedBalance, isDisable, lockedInRef, timeToUnlock, totalLocked, unlockableAmount } = useLockedInReferenda(address, refresh);

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
      <Grid item pb='2px' pt='3px'>
        <Grid alignItems='flex-end' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300 }} xs>
            {t('Locked in Referenda')}
          </Grid>
          <Grid alignItems='flex-end' container direction='column' item sx={{ width: 'fit-content' }}>
            <Grid item sx={{ fontSize: '18px', fontWeight: 400, lineHeight: '20px' }} textAlign='right'>
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
                fontSize='16px'
                price={price}
              />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' sx={{ cursor: unlockableAmount && !unlockableAmount.isZero() ? 'pointer' : undefined, ml: '8px', width: '26px' }}>
            <FontAwesomeIcon
              color={isDisable ? theme.palette.action.disabledBackground : theme.palette.secondary.light}
              icon={unlockableAmount && !unlockableAmount.isZero() ? faUnlockAlt : faLock}
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
      <Divider sx={{ bgcolor: 'divider', height: '1px', my: '5px' }} />
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
