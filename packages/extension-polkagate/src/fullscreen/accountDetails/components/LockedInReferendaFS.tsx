// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

// @ts-ignore
import type { PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import type { UnlockInformationType } from '..';

import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN_MAX_INTEGER } from '@polkadot/util';

import { FormatPrice, ShowBalance } from '../../../components';
import { useAccountLocks, useCurrentBlockNumber, useHasDelegated, useInfo, useTimeToUnlock, useTranslation } from '../../../hooks';
import { TIME_TO_SHAKE_ICON } from '../../../util/constants';
import { popupNumbers } from '..';

interface DisplayBalanceProps {
  address: string | undefined;
  price: number | undefined;
  refreshNeeded?: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
  setUnlockInformation: React.Dispatch<React.SetStateAction<UnlockInformationType | undefined>>;
}

export default function LockedInReferendaFS ({ address, price, refreshNeeded, setDisplayPopup, setUnlockInformation }: DisplayBalanceProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, decimal, token } = useInfo(address);
  const delegatedBalance = useHasDelegated(address, refreshNeeded);
  const referendaLocks = useAccountLocks(address, 'referenda', 'convictionVoting', false, refreshNeeded);
  const currentBlock = useCurrentBlockNumber(address);
  const { timeToUnlock, totalLocked, unlockableAmount } = useTimeToUnlock(address, referendaLocks, refreshNeeded);

  const [shake, setShake] = useState<boolean>();

  const classToUnlock = currentBlock ? referendaLocks?.filter((ref) => ref.endBlock.ltn(currentBlock) && ref.classId.lt(BN_MAX_INTEGER)) : undefined;
  const isDisable = useMemo(() => !unlockableAmount || unlockableAmount.isZero() || !classToUnlock || !totalLocked, [classToUnlock, totalLocked, unlockableAmount]);

  const hasDescription = useMemo(() =>
    (unlockableAmount && !unlockableAmount.isZero()) || (delegatedBalance && !delegatedBalance.isZero()) || timeToUnlock
  , [delegatedBalance, timeToUnlock, unlockableAmount]);

  useEffect(() => {
    if (unlockableAmount && !unlockableAmount.isZero()) {
      setShake(true);
      setTimeout(() => setShake(false), TIME_TO_SHAKE_ICON);
    }
  }, [unlockableAmount]);

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
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: hasDescription ? '85px' : '70px', p: '15px 40px' }}>
      <Typography fontSize='18px' fontWeight={400}>
        {t('Locked in Referenda')}
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
              />
            </Grid>
            <Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '35px', mx: '10px', my: 'auto' }} />
            <FormatPrice
              amount={totalLocked}
              decimals={decimal}
              fontSize= '22px'
              fontWeight={ 400}
              price={price}
              skeletonHeight={20}
            />
          </Grid>
          <Typography fontSize='12px' fontWeight={500} textAlign='right'>
            {api && unlockableAmount && !unlockableAmount.isZero()
              ? `${api.createType('Balance', unlockableAmount).toHuman()} can be unlocked`
              : delegatedBalance && !delegatedBalance.isZero()
                ? t('Locked as delegated')
                : timeToUnlock === null ? '' : timeToUnlock
            }
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
