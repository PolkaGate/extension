// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, Motion } from '@polkadot/extension-polkagate/src/components';
import { useBackground, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useNotifications from '@polkadot/extension-polkagate/src/hooks/useNotifications';
import { UserDashboardHeader } from '@polkadot/extension-polkagate/src/partials';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style';

import { groupByDay, type PayoutsProp, type ReceivedFundInformation, type StakingRewardInformation, type TransfersProp } from './util';

function Notification () {
  useBackground('default');

  const { markAsRead, notifications } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const groupReceivedFundsByDate = useMemo(() => {
    const receivedFunds = notifications.receivedFunds;

    return groupByDay<ReceivedFundInformation, TransfersProp>(receivedFunds);
  }, [notifications.receivedFunds]);

  const groupStakingRewardsByDate = useMemo(() => {
    const stakingRewards = notifications.stakingRewards;

    return groupByDay<StakingRewardInformation, PayoutsProp>(stakingRewards);
  }, [notifications.stakingRewards]);

  console.log('groupReceivedFundsByDate:', groupStakingRewardsByDate);

  const backHome = useCallback(() => navigate('/') as void, [navigate]);

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        onClick={backHome}
        style={{ pb: 0 }}
        text={t('Your Staking Positions')}
      />
      <Motion variant='slide'>
        <VelvetBox>
          <></>
        </VelvetBox>
      </Motion>
    </Grid>
  );
}

export default Notification;
