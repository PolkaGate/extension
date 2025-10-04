// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, Motion } from '@polkadot/extension-polkagate/src/components';
import { useBackground, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useNotifications from '@polkadot/extension-polkagate/src/hooks/useNotifications';
import { UserDashboardHeader } from '@polkadot/extension-polkagate/src/partials';

import Notifications from './Notifications';

function Notification () {
  useBackground('default');

  const { t } = useTranslation();
  const navigate = useNavigate();

  const aaa = useNotifications();

  console.log('aaaaaaaaaaaaaaaaa:', aaa);

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
        <Notifications />
      </Motion>
    </Grid>
  );
}

export default Notification;
