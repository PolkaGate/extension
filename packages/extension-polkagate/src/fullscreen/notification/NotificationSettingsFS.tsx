// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, BuyCrypto, MedalStar, Notification as NotificationIcon, UserOctagon } from 'iconsax-react';
import React, { useMemo } from 'react';

import { ActionCard, MySwitch } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN, SUPPORTED_STAKING_NOTIFICATION_CHAIN } from '@polkadot/extension-polkagate/src/popup/notification/constant';
import useNotificationSettings, { type NotificationSettingType, Popups } from '@polkadot/extension-polkagate/src/popup/notification/hook/useNotificationSettings';
import { noop } from '@polkadot/util';

import { DraggableModal } from '../components/DraggableModal';
import SelectAccount from './partials/SelectAccount';
import SelectChain from './partials/SelectChain';

const CARD_STYLE = { alignItems: 'center', borderColor: '#2D1E4A', height: '64px' };

interface SettingUIProps {
  openPopup: (popup: Popups) => () => void;
  toggleNotification: () => void;
  notificationSetting: NotificationSettingType;
  toggleReceivedFunds: () => void;
}

const SettingUI = ({ notificationSetting, openPopup, toggleNotification, toggleReceivedFunds }: SettingUIProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ gap: '8px', p: '15px 5px 0', width: '100%' }}>
      <ActionCard
        Icon={NotificationIcon}
        iconColor='#FF4FB9'
        iconSize={24}
        iconWithoutTransform
        onClick={noop}
        showColorBall={false}
        style={{ ...CARD_STYLE, bgcolor: '#05091C' }}
        title={t('Enable Notifications')}
      >
        <MySwitch
          checked={notificationSetting.enable}
          onChange={toggleNotification}
          value={notificationSetting.enable}
        />
      </ActionCard>
      <ActionCard
        Icon={ArrowCircleDown2}
        iconColor='#FF4FB9'
        iconSize={24}
        iconWithoutTransform
        onClick={noop}
        showColorBall={false}
        style={{ ...CARD_STYLE, bgcolor: '#05091C' }}
        title={t('Enable Receive Fund')}
      >
        <MySwitch
          checked={notificationSetting.receivedFunds}
          onChange={toggleReceivedFunds}
          value={notificationSetting.receivedFunds}
        />
      </ActionCard>
      <ActionCard
        Icon={UserOctagon}
        iconColor='#FF4FB9'
        iconSize={24}
        iconWithoutTransform
        onClick={openPopup(Popups.ACCOUNTS)}
        style={{ mt: '16px', ...CARD_STYLE }}
        title={t('Accounts')}
      >
        <Typography color='#AA83DC' sx={{ bgcolor: '#BFA1FF26', borderRadius: '10px', mr: '2px', p: '3px 10px' }} variant='B-3'>
          {notificationSetting.accounts?.length}
        </Typography>
      </ActionCard>
      <ActionCard
        Icon={MedalStar}
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
  );
};

interface Props {
  handleClose: () => void;
}

function NotificationSettingsFS ({ handleClose }: Props) {
  const { t } = useTranslation();

  const { closePopup,
    notificationSetting,
    openPopup,
    popups,
    setAccounts,
    setGovernanceChains,
    setStakingRewardsChains,
    toggleNotification,
    toggleReceivedFunds } = useNotificationSettings();

  const ui = useMemo(() => {
    switch (popups) {
      case Popups.NONE:
        return (
          <SettingUI
            notificationSetting={notificationSetting}
            openPopup={openPopup}
            toggleNotification={toggleNotification}
            toggleReceivedFunds={toggleReceivedFunds}
          />);

      case Popups.ACCOUNTS:
        return (
          <SelectAccount
            onAccounts={setAccounts}
            previousState={notificationSetting.accounts}
          />);

      case Popups.GOVERNANCE:
        return (
          <SelectChain
            onChains={setGovernanceChains}
            options={SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN}
            previousState={notificationSetting.governance}
          />);

      case Popups.STAKING_REWARDS:
        return (
          <SelectChain
            onChains={setStakingRewardsChains}
            options={SUPPORTED_STAKING_NOTIFICATION_CHAIN}
            previousState={notificationSetting.stakingRewards}
          />);
    }
  }, [notificationSetting, openPopup, popups, setAccounts, setGovernanceChains, setStakingRewardsChains, toggleNotification, toggleReceivedFunds]);

  const { onClose, title }: { onClose: () => void, title: string } = useMemo(() => {
    switch (popups) {
      case Popups.ACCOUNTS:
        return {
          onClose: closePopup,
          title: t('Select Accounts')
        };

      case Popups.GOVERNANCE:
        return {
          onClose: closePopup,
          title: t('Select Chains')
        };

      case Popups.STAKING_REWARDS:
        return {
          onClose: closePopup,
          title: t('Select Chains')
        };

      default:
        return {
          onClose: handleClose,
          title: t('Notification Settings')
        };
    }
  }, [closePopup, handleClose, popups, t]);

  return (
    <DraggableModal
      onClose={onClose}
      open={true}
      showBackIconAsClose
      style={{ backgroundColor: '#1B133C', minHeight: '600px', padding: ' 20px 10px 10px' }}
      title={title}
    >
      {ui}
    </DraggableModal>
  );
}

export default NotificationSettingsFS;
