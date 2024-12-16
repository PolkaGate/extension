// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Collapse, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useReducer } from 'react';

import { Checkbox2, Switch, TwoButtons } from '../../components';
import { getStorage, setStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { POPUP_MENUS } from '../../partials/Menu';
import { DEFAULT_NOTIFICATION_SETTING, NOTIFICATION_SETTING_KEY } from './constant';

interface Props {
  setShowPopup: React.Dispatch<React.SetStateAction<POPUP_MENUS>>;
}

interface NotificationSettingType {
  enable: boolean | undefined;
  governance: string[] | undefined; // chainNames
  stakingRewards: string[] | undefined; // chainNames
}

type NotificationSettingsActionType =
  | { type: 'INITIAL'; payload: NotificationSettingType }
  | { type: 'FUNCTION'; }
  | { type: 'GOVERNANCE'; payload: string[] }
  | { type: 'STAKING_REWARDS'; payload: string[] };

const initialNotificationState: NotificationSettingType = {
  enable: undefined,
  governance: undefined,
  stakingRewards: undefined
};

const notificationSettingReducer = (
  state: NotificationSettingType,
  action: NotificationSettingsActionType
): NotificationSettingType => {
  switch (action.type) {
    case 'INITIAL':
      return action.payload;
    case 'FUNCTION':
      return { ...state, enable: !state.enable };
    case 'GOVERNANCE':
      return { ...state, governance: action.payload };
    case 'STAKING_REWARDS':
      return { ...state, stakingRewards: action.payload };
    default:
      return state;
  }
};

export default function NotificationSettings ({ setShowPopup }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [notificationSetting, dispatch] = useReducer(notificationSettingReducer, initialNotificationState);

  useEffect(() => {
    getStorage(NOTIFICATION_SETTING_KEY, true)
      .then((notificationSetting) => dispatch({ payload: notificationSetting as NotificationSettingType | undefined ?? DEFAULT_NOTIFICATION_SETTING, type: 'INITIAL' }))
      .catch(console.error);
  }, []);

  const onToggleNotification = useCallback(() => {
    dispatch({ type: 'FUNCTION' });
  }, []);

  const onGovernanceChains = useCallback((chainName: string) => () => {
    const found = notificationSetting.governance?.find((network) => network.toLowerCase() === chainName.toLowerCase());
    const newChainList = found
      ? notificationSetting.governance?.filter((network) => network.toLowerCase() !== chainName.toLowerCase())
      : [...(notificationSetting.governance ?? []), chainName];

    dispatch({ payload: newChainList ?? [], type: 'GOVERNANCE' });
  }, [notificationSetting.governance]);

  const onStakingRewardsChains = useCallback((chainName: string) => () => {
    const found = notificationSetting.stakingRewards?.find((network) => network.toLowerCase() === chainName.toLowerCase());
    const newChainList = found
      ? notificationSetting.stakingRewards?.filter((network) => network.toLowerCase() !== chainName.toLowerCase())
      : [...(notificationSetting.stakingRewards ?? []), chainName];

    dispatch({ payload: newChainList ?? [], type: 'STAKING_REWARDS' });
  }, [notificationSetting.stakingRewards]);

  const onNotificationApply = useCallback(() => {
    setStorage(NOTIFICATION_SETTING_KEY, notificationSetting, true).catch(console.error);
    setShowPopup(POPUP_MENUS.NONE);
  }, [notificationSetting, setShowPopup]);

  const onNotificationCancel = useCallback(() => {
    setShowPopup(POPUP_MENUS.NONE);
  }, [setShowPopup]);

  return (
    <Grid container justifyContent='space-between' sx={{ display: 'block', height: '100%', position: 'relative' }}>
      <Grid item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main', mb: '20px', py: '10px', textAlign: 'center' }} xs={12}>
        <Typography fontSize='20px'>
          {t('Manage notification')}
        </Typography>
      </Grid>
      <Grid container item justifyContent='space-between' mx='10px'>
        <Typography fontSize='16px' fontWeight={300} textAlign='left' width='100%'>
          {t('Set up notifications to track your accounts, governance updates, and staking rewards.')}
        </Typography>
        <Grid alignItems='center' container item justifyContent='space-between' mb='40px' mt='20px' pr='10px'>
          <Typography fontSize='16px' fontWeight={400}>
            {t('Enable notifications')}
          </Typography>
          <Switch
            isChecked={notificationSetting.enable}
            onChange={onToggleNotification}
            theme={theme}
          />
        </Grid>
        <Collapse in={notificationSetting.enable}>
          <>
            <Grid container item justifyContent='space-evenly'>
              <Typography fontSize='16px' fontWeight={400} mb='5px' textAlign='left' width='100%'>
                {t('Governance')}:
              </Typography>
              <Grid item textAlign='left'>
                <Checkbox2
                  checked={notificationSetting.governance?.includes('polkadot')}
                  iconStyle={{ transform: 'scale(1.13)' }}
                  label='Polkadot'
                  labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
                  onChange={onGovernanceChains('polkadot')}
                />
              </Grid>
              <Grid item textAlign='left'>
                <Checkbox2
                  checked={notificationSetting.governance?.includes('kusama')}
                  iconStyle={{ transform: 'scale(1.13)' }}
                  label='Kusama'
                  labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
                  onChange={onGovernanceChains('kusama')}
                />
              </Grid>
            </Grid>
            <Grid container item justifyContent='space-evenly' mt='25px'>
              <Typography fontSize='16px' fontWeight={400} mb='5px' textAlign='left' width='100%'>
                {t('Staking rewards')}:
              </Typography>
              <Grid item textAlign='left'>
                <Checkbox2
                  checked={notificationSetting.stakingRewards?.includes('polkadot')}
                  iconStyle={{ transform: 'scale(1.13)' }}
                  label='Polkadot'
                  labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
                  onChange={onStakingRewardsChains('polkadot')}
                />
              </Grid>
              <Grid item textAlign='left'>
                <Checkbox2
                  checked={notificationSetting.stakingRewards?.includes('kusama')}
                  iconStyle={{ transform: 'scale(1.13)' }}
                  label='Kusama'
                  labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
                  onChange={onStakingRewardsChains('kusama')}
                />
              </Grid>
            </Grid>
          </>
        </Collapse>
      </Grid>
      <Grid container item sx={{ bottom: '80px', height: '70px', position: 'absolute' }}>
        <TwoButtons
          ml='0px'
          mt='1px'
          onPrimaryClick={onNotificationApply}
          onSecondaryClick={onNotificationCancel}
          primaryBtnText={t('Confirm')}
          secondaryBtnText={t('Reject')}
          width='100%'
        />
      </Grid>
    </Grid>
  );
}
