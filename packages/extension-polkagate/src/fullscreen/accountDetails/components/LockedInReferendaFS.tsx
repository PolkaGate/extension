// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { UnlockInformationType } from '..';

import { faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { FormatPrice, ShowBalance } from '../../../components';
import { useAnimateOnce, useInfo, useLockedInReferenda, useTranslation } from '../../../hooks';
import { TIME_TO_SHAKE_ICON } from '../../../util/constants';
import { popupNumbers } from '..';

interface DisplayBalanceProps {
  address: string | undefined;
  price: number | undefined;
  refreshNeeded?: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
  setUnlockInformation: React.Dispatch<React.SetStateAction<UnlockInformationType | undefined>>;
}

export default function LockedInReferendaFS({ address, price, refreshNeeded, setDisplayPopup, setUnlockInformation }: DisplayBalanceProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, decimal, token } = useInfo(address);

  const { classToUnlock, delegatedBalance, hasDescription, isDisable, timeToUnlock, totalLocked, unlockableAmount } = useLockedInReferenda(address, refreshNeeded);
  const shake = useAnimateOnce(unlockableAmount && !unlockableAmount.isZero(), { duration: TIME_TO_SHAKE_ICON });

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
            <Grid item sx={{ fontSize: '20px', fontWeight: 600, m: 'auto' }}>
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
              fontSize='20px'
              fontWeight={400}
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
              icon={unlockableAmount && !unlockableAmount.isZero() ? faUnlockAlt : faLock}
              shake={shake}
              style={{ height: '25px' }}
            />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
