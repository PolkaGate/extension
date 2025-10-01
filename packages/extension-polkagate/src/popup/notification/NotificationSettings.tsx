// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-no-bind */

import { Grid, Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, BuyCrypto, MedalStar, Notification as NotificationIcon, UserOctagon } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { noop } from '@polkadot/util';

import { AccountContext, ActionCard, BackWithLabel, Motion, MySwitch } from '../../components';
import { getStorage, setStorage } from '../../components/Loading';
import { useSelectedAccount, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { SETTING_PAGES } from '../settings';
import SelectAccount from './partials/SelectAccount';
import SelectChain from './partials/SelectChain';
import { DEFAULT_NOTIFICATION_SETTING, MAX_ACCOUNT_COUNT_NOTIFICATION, SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN, SUPPORTED_STAKING_NOTIFICATION_CHAIN } from './constant';

export interface TextValuePair {
  text: string;
  value: string;
}

export interface NotificationSettingType {
  accounts: string[] | undefined; // substrate addresses
  enable: boolean | undefined;
  receivedFunds: boolean | undefined;
  governance: string[] | undefined; // genesisHashes
  stakingRewards: string[] | undefined; // genesisHashes
}

type NotificationSettingsActionType =
  | { type: 'INITIAL'; payload: NotificationSettingType }
  | { type: 'TOGGLE_ENABLE'; }
  | { type: 'TOGGLE_RECEIVED_FUNDS'; }
  | { type: 'SET_ACCOUNTS'; payload: string[] }
  | { type: 'SET_GOVERNANCE'; payload: string[] }
  | { type: 'SET_STAKING_REWARDS'; payload: string[] };

const initialNotificationState: NotificationSettingType = {
  accounts: undefined,
  enable: undefined,
  governance: undefined,
  receivedFunds: undefined,
  stakingRewards: undefined
};

const notificationSettingReducer = (
  state: NotificationSettingType,
  action: NotificationSettingsActionType
): NotificationSettingType => {
  switch (action.type) {
    case 'INITIAL':
      return action.payload;
    case 'TOGGLE_ENABLE':
      return { ...state, enable: !state.enable };
    case 'TOGGLE_RECEIVED_FUNDS':
      return { ...state, receivedFunds: !state.receivedFunds };
    case 'SET_GOVERNANCE':
      return { ...state, governance: action.payload };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'SET_STAKING_REWARDS':
      return { ...state, stakingRewards: action.payload };
    default:
      return state;
  }
};

export enum Popups {
  NONE,
  ACCOUNTS,
  GOVERNANCE,
  STAKING_REWARDS
}

const CARD_STYLE = { alignItems: 'center', height: '64px' };

export default function NotificationSettings () {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAddress = useSelectedAccount()?.address;
  const { accounts } = useContext(AccountContext);

  const [notificationSetting, dispatch] = useReducer(notificationSettingReducer, initialNotificationState);
  const [defaultFlag, setDefaultFlag] = useState<boolean>(false);
  const [popups, setPopup] = useState<Popups>(Popups.NONE);

  const notificationSettingRef = useRef(notificationSetting);

  useEffect(() => {
    // Update the ref whenever notificationSetting changes
    notificationSettingRef.current = notificationSetting;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(notificationSetting)]); // Deep-watch for changes

  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const storedSettings = await getStorage(STORAGE_KEY.NOTIFICATION_SETTINGS);

        if (!storedSettings) {
          setDefaultFlag(true);

          return;
        }

        dispatch({
          payload: storedSettings as NotificationSettingType,
          type: 'INITIAL'
        });
      } catch (error) {
        console.error('Failed to load notification settings:', error);
        setDefaultFlag(true);
      }
    };

    loadNotificationSettings().catch(console.error);
  }, []);

  useEffect(() => {
    if (!defaultFlag) {
      return;
    }

    const addresses = accounts.map(({ address }) => address).slice(0, MAX_ACCOUNT_COUNT_NOTIFICATION);

    dispatch({
      payload: {
        ...DEFAULT_NOTIFICATION_SETTING, // accounts is an empty array in the constant file
        accounts: addresses
      },
      type: 'INITIAL'
    });
    setDefaultFlag(false);
  }, [accounts, defaultFlag]);

  const handleChainsChanges = useCallback((setting: NotificationSettingType) => {
    setStorage(STORAGE_KEY.NOTIFICATION_SETTINGS, setting).catch(console.error);
    // updateSavedAssetsInStorage();
  }, []);

  useEffect(() => {
    // Apply notification setting changes function that runs on unmount
    return () => {
      console.log('apply notification setting changes function that runs on unmount');
      handleChainsChanges(notificationSettingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggleNotification = useCallback(() => {
    dispatch({ type: 'TOGGLE_ENABLE' });
  }, []);

  const onToggleReceivedFunds = useCallback(() => {
    dispatch({ type: 'TOGGLE_RECEIVED_FUNDS' });
  }, []);

  const closePopup = useCallback(() => setPopup(Popups.NONE), []);

  const onGovernanceChains = useCallback((chains: string[]) => () => {
    dispatch({ payload: chains, type: 'SET_GOVERNANCE' });
    closePopup();
  }, [closePopup]);

  const onStakingRewardsChains = useCallback((chains: string[]) => () => {
    dispatch({ payload: chains, type: 'SET_STAKING_REWARDS' });
    closePopup();
  }, [closePopup]);

  const onAccounts = useCallback((addresses: string[]) => () => {
    dispatch({ payload: addresses, type: 'SET_ACCOUNTS' });
    closePopup();
  }, [closePopup]);

  const onNotificationCancel = useCallback(() => navigate(`/settings-${SETTING_PAGES.ACCOUNT}/${selectedAddress}`) as void, [navigate, selectedAddress]);
  const openPopup = useCallback((popup: Popups) => () => setPopup(popup), []);

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
              onClick={noop}
              showColorBall={false}
              style={{ ...CARD_STYLE, bgcolor: '#05091C' }}
              title={t('Enable Notifications')}
            >
              <MySwitch
                checked={notificationSetting.enable}
                onChange={onToggleNotification}
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
                onChange={onToggleReceivedFunds}
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
          <HomeMenu />
        </Motion>
      </Grid>
      <SelectAccount
        onAccounts={onAccounts}
        onClose={closePopup}
        open={popups === Popups.ACCOUNTS}
        previousState={notificationSetting.accounts}
      />
      <SelectChain
        onChains={onGovernanceChains}
        onClose={closePopup}
        open={popups === Popups.GOVERNANCE}
        options={SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN}
        previousState={notificationSetting.governance}
        title={t('Governance')}
      />
      <SelectChain
        onChains={onStakingRewardsChains}
        onClose={closePopup}
        open={popups === Popups.STAKING_REWARDS}
        options={SUPPORTED_STAKING_NOTIFICATION_CHAIN}
        previousState={notificationSetting.stakingRewards}
        title={t('Staking Rewards')}
      />
    </>
  );
}
