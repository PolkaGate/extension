// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components';
import { getStorage, setStorage, watchStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { DEFAULT_NOTIFICATION_SETTING, MAX_ACCOUNT_COUNT_NOTIFICATION, SET_UP_NOTIFICATION_SETTING } from '../constant';

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
      return { ...state, enable: !state.enable, receivedFunds: state.enable ? false : state.receivedFunds };
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

export default function useNotificationSettings (justLoadInfo = false) {
  const { accounts } = useContext(AccountContext);
  const [notificationSetting, dispatch] = useReducer(notificationSettingReducer, initialNotificationState);
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
          dispatch({
            payload: DEFAULT_NOTIFICATION_SETTING,
            type: 'INITIAL'
          });

          return;
        }

        dispatch({
          payload: storedSettings as NotificationSettingType,
          type: 'INITIAL'
        });
      } catch (error) {
        console.error('Failed to load notification settings:', error);

        dispatch({
          payload: DEFAULT_NOTIFICATION_SETTING,
          type: 'INITIAL'
        });
      }
    };

    loadNotificationSettings().catch(console.error);
  }, []);

  useEffect(() => {
    if (justLoadInfo) {
      const unsubscribe = watchStorage(STORAGE_KEY.NOTIFICATION_SETTINGS, (stored: NotificationSettingType) => {
        dispatch({
          payload: stored,
          type: 'INITIAL'
        });
      });

      return () => {
        unsubscribe();
      };
    }

    return undefined;
  }, [justLoadInfo]);

  const handleChainsChanges = useCallback((setting: NotificationSettingType) => {
    setStorage(STORAGE_KEY.NOTIFICATION_SETTINGS, setting).catch(console.error);
  }, []);

  useEffect(() => {
    if (justLoadInfo) {
      return;
    }

    // Apply notification setting changes function that runs on unmount
    return () => {
      console.log('apply notification setting changes function that runs on unmount');
      handleChainsChanges(notificationSettingRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justLoadInfo]);

  const toggleNotification = useCallback(() => {
    const isFirstTime = [...(notificationSetting.governance ?? []), ...(notificationSetting.stakingRewards ?? []), ...(notificationSetting.accounts ?? [])].length === 0;

    if (isFirstTime) {
      const addresses = accounts.map(({ address }) => address).slice(0, MAX_ACCOUNT_COUNT_NOTIFICATION);

      dispatch({
        payload: {
          ...SET_UP_NOTIFICATION_SETTING, // accounts is an empty array in the constant file
          accounts: addresses // This line fills the empty accounts array with random address from the extension
        },
        type: 'INITIAL'
      });

      return;
    }

    dispatch({ type: 'TOGGLE_ENABLE' });
  }, [accounts, notificationSetting.accounts, notificationSetting.governance, notificationSetting.stakingRewards]);

  const toggleReceivedFunds = useCallback(() => {
    dispatch({ type: 'TOGGLE_RECEIVED_FUNDS' });
  }, []);

  const closePopup = useCallback(() => setPopup(Popups.NONE), []);

  const setGovernanceChains = useCallback((chains: string[]) => () => {
    dispatch({ payload: chains, type: 'SET_GOVERNANCE' });
    closePopup();
  }, [closePopup]);

  const setStakingRewardsChains = useCallback((chains: string[]) => () => {
    dispatch({ payload: chains, type: 'SET_STAKING_REWARDS' });
    closePopup();
  }, [closePopup]);

  const setAccounts = useCallback((addresses: string[]) => () => {
    dispatch({ payload: addresses, type: 'SET_ACCOUNTS' });
    closePopup();
  }, [closePopup]);

  const openPopup = useCallback((popup: Popups) => () => setPopup(popup), []);

  return {
    closePopup,
    notificationSetting,
    openPopup,
    popups,
    setAccounts,
    setGovernanceChains,
    setStakingRewardsChains,
    toggleNotification,
    toggleReceivedFunds
  };
}
