// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-no-bind */

import { Grid, Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, BuyCrypto, Notification as NotificationIcon, Record, UserOctagon } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionCard, BackWithLabel, Motion, MySwitch } from '../../components';
import { useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { SETTING_PAGES } from '../settings';
import useNotificationSettings, { Popups } from './hook/useNotificationSettings';
import SelectAccount from './partials/SelectAccount';
import SelectChain from './partials/SelectChain';
import { SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN, SUPPORTED_STAKING_NOTIFICATION_CHAIN } from './constant';

export interface TextValuePair {
  text: string;
  value: string;
}

const CARD_STYLE = { alignItems: 'center', height: '64px' };

export default function NotificationSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAddress = useSelectedAccount()?.address;

  const { closePopup,
    notificationSetting,
    openPopup,
    popups,
    setAccounts,
    setGovernanceChains,
    setStakingRewardsChains,
    toggleNotification,
    toggleReceivedFunds } = useNotificationSettings();

  const onNotificationCancel = useCallback(() => navigate(`/settings-${SETTING_PAGES.ACCOUNT}/${selectedAddress}`) as void, [navigate, selectedAddress]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          onClick={onNotificationCancel}
          style={{ pb: 0 }}
          text={t('Notification')}
        />
        <Motion variant='slide'>
          <Stack direction='column' sx={{ gap: '8px', p: '15px', width: '100%' }}>
            <ActionCard
              Icon={NotificationIcon}
              iconColor='#FF4FB9'
              iconSize={24}
              iconWithoutTransform
              onClick={toggleNotification}
              showChevron={false}
              showColorBall={false}
              style={{ ...CARD_STYLE, bgcolor: '#05091C' }}
              title={t('Enable Notifications')}
            >
              <MySwitch
                checked={notificationSetting.enable}
                value={notificationSetting.enable}
              />
            </ActionCard>
            <ActionCard
              Icon={ArrowCircleDown2}
              iconColor='#FF4FB9'
              iconSize={24}
              iconWithoutTransform
              onClick={toggleReceivedFunds}
              showChevron={false}
              showColorBall={false}
              style={{ ...CARD_STYLE, bgcolor: '#05091C' }}
              title={t('Enable Received Funds')}
            >
              <MySwitch
                checked={notificationSetting.receivedFunds}
                value={notificationSetting.receivedFunds}
              />
            </ActionCard>
            <ActionCard
              Icon={UserOctagon}
              iconColor='#FF4FB9'
              iconSize={24}
              iconWithoutTransform
              onClick={openPopup(Popups.ACCOUNTS)}
              style={{ ...CARD_STYLE }}
              title={t('Accounts')}
            >
              <Typography color='#AA83DC' sx={{ bgcolor: '#BFA1FF26', borderRadius: '10px', mr: '2px', p: '3px 10px' }} variant='B-3'>
                {notificationSetting.accounts?.length}
              </Typography>
            </ActionCard>
            <ActionCard
              Icon={Record}
              iconColor='#FF4FB9'
              iconSize={24}
              iconWithoutTransform
              onClick={openPopup(Popups.GOVERNANCE)}
              style={{ ...CARD_STYLE }}
              title={t('Governance')}
            />
            <ActionCard
              Icon={BuyCrypto}
              iconColor='#FF4FB9'
              iconSize={24}
              iconWithoutTransform
              onClick={openPopup(Popups.STAKING_REWARDS)}
              style={{ ...CARD_STYLE }}
              title={t('Staking Rewards')}
            />
          </Stack>
        </Motion>
        <HomeMenu />
      </Grid>
      <SelectAccount
        onAccounts={setAccounts}
        onClose={closePopup}
        open={popups === Popups.ACCOUNTS}
        previousSelectedAccounts={notificationSetting.accounts}
      />
      <SelectChain
        onChains={setGovernanceChains}
        onClose={closePopup}
        open={popups === Popups.GOVERNANCE}
        options={SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN}
        previousState={notificationSetting.governance}
        title={t('Governance')}
      />
      <SelectChain
        onChains={setStakingRewardsChains}
        onClose={closePopup}
        open={popups === Popups.STAKING_REWARDS}
        options={SUPPORTED_STAKING_NOTIFICATION_CHAIN}
        previousState={notificationSetting.stakingRewards}
        title={t('Staking Rewards')}
      />
    </>
  );
}
