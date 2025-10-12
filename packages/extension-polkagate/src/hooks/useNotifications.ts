// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationActionType, NotificationsType } from '../popup/notification/types';
import type { DropdownOption } from '../util/types';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { getStorage, setStorage } from '../components/Loading';
import { AUTO_MARK_AS_READ_DELAY, SUBSCAN_SUPPORTED_CHAINS } from '../popup/notification/constant';
import { getPayoutsInformation, getReceivedFundsInformation, getReferendasInformation } from '../popup/notification/helpers';
import useNotificationSettings from '../popup/notification/hook/useNotificationSettings';
import { generateReceivedFundNotifications, generateReferendaNotifications, generateStakingRewardNotifications, groupNotificationsByDay, markMessagesAsRead, updateReferendas } from '../popup/notification/util';
import { sanitizeChainName } from '../util';
import { STORAGE_KEY } from '../util/constants';
import { useGenesisHashOptions, useSelectedChains } from '.';

const initialNotificationState: NotificationsType = {
  isFirstTime: undefined,
  latestLoggedIn: undefined,
  notificationMessages: undefined,
  receivedFunds: undefined,
  referendas: undefined,
  stakingRewards: undefined
};

const notificationReducer = (
  state: NotificationsType,
  action: NotificationActionType
): NotificationsType => {
  switch (action.type) {
    case 'INITIALIZE':
      // Initialize notifications for the first time
      return {
        isFirstTime: true,
        latestLoggedIn: Math.floor(Date.now() / 1000), // timestamp in seconds
        notificationMessages: [],
        receivedFunds: null,
        referendas: null,
        stakingRewards: null
      };

    case 'CHECK_FIRST_TIME':
      // Mark as first time
      return { ...state, isFirstTime: true };

    case 'MARK_AS_READ':
      // Mark all messages as read
      return { ...state, notificationMessages: markMessagesAsRead(state.notificationMessages ?? []) };

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    case 'SET_REFERENDA': {
      return {
        ...state,
        isFirstTime: false,
        notificationMessages: [...generateReferendaNotifications(state.latestLoggedIn ?? Math.floor(Date.now() / 1000), state.referendas, action.payload), ...(state.notificationMessages ?? [])],
        referendas: updateReferendas(state.referendas, action.payload)
      };
    }

    case 'SET_RECEIVED_FUNDS':
      return {
        ...state,
        isFirstTime: false,
        notificationMessages: [...generateReceivedFundNotifications(state.latestLoggedIn ?? Math.floor(Date.now() / 1000), action.payload ?? []), ...(state.notificationMessages ?? [])],
        receivedFunds: action.payload
      };

    case 'SET_STAKING_REWARDS':
      return {
        ...state,
        isFirstTime: false,
        notificationMessages: [...generateStakingRewardNotifications(state.latestLoggedIn ?? Math.floor(Date.now() / 1000), action.payload ?? []), ...(state.notificationMessages ?? [])],
        stakingRewards: action.payload
      };

    default:
      return state;
  }
};

enum status {
  NONE,
  FETCHING,
  FETCHED
}

/**
 * React hook for managing notification settings and state.
 *
 * This hook handles:
 * - Loading and saving notification settings from storage.
 * - Initializing notification state and loading saved notifications.
 * - Fetching received funds and staking rewards notifications.
 * - Listening for governance-related notifications via a web worker.
 * - Marking notifications as read.
 * - Persisting notifications on window unload.
 *
 * @returns An object containing:
 * - `notifications`: The current notifications state.
 * - `notificationItems`: The current notification messages state.
 * - `settings`: The current notifications settings.
 *
 * @remarks
 * This hook uses several internal flags and refs to avoid duplicate network calls and redundant state updates.
 */
export default function useNotifications () {
  const { notificationSetting } = useNotificationSettings();
  const { accounts, enable: isNotificationEnable, governance: governanceChains, receivedFunds: isReceivedFundsEnable, stakingRewards: stakingRewardChains } = notificationSetting;

  const selectedChains = useSelectedChains();
  const allChains = useGenesisHashOptions(false);

  // Refs to avoid duplicate network calls and redundant state updates
  const isGettingReceivedFundRef = useRef<status>(status.NONE); // Flag to avoid duplicate calls of getReceivedFundsInformation
  const isGettingPayoutsRef = useRef<status>(status.NONE); // Flag to avoid duplicate calls of getPayoutsInformation
  const isGettingNotificationsRef = useRef<status>(status.NONE); // Flag to avoid duplicate calls of getNotificationsInformation
  const initializedRef = useRef<boolean>(false); // Flag to avoid duplicate initialization
  const isSavingRef = useRef<boolean>(false); // Flag to avoid duplicate save in the storage

  // Memoized list of selected chain options
  const chains = useMemo(() => {
    if (!selectedChains) {
      return undefined;
    }

    return allChains
      .filter(({ value }) => selectedChains.includes(value as string))
      .map(({ text, value }) => ({ text, value } as DropdownOption));
  }, [allChains, selectedChains]);

  const [notifications, dispatchNotifications] = useReducer(notificationReducer, initialNotificationState);

  // Whether notifications are turned off
  const notificationIsOff = useMemo(() => isNotificationEnable === false || accounts?.length === 0, [accounts?.length, isNotificationEnable]);

  // Mark all notifications as read
  const markAsRead = useCallback(() => {
    const timer = setTimeout(() => {
      // ✅ This runs only after the component has been mounted for 5 seconds
      dispatchNotifications({ type: 'MARK_AS_READ' });
    }, AUTO_MARK_AS_READ_DELAY);

    return () => clearTimeout(timer); // return cleanup function if needed
  }, []);

  // Fetch received funds notifications
  const receivedFunds = useCallback(async () => {
    if (chains && isGettingReceivedFundRef.current === status.NONE && accounts && isReceivedFundsEnable) {
      isGettingReceivedFundRef.current = status.FETCHING;

      // Filter supported chains for Subscan
      const filteredSupportedChains = chains.filter(({ text }) => {
        const sanitized = sanitizeChainName(text)?.toLowerCase();

        if (!sanitized) {
          return false;
        }

        return SUBSCAN_SUPPORTED_CHAINS.find((chainName) => chainName.toLowerCase() === sanitized);
      }).map(({ value }) => value as string);

      const receivedFunds = await getReceivedFundsInformation(accounts, filteredSupportedChains);

      isGettingReceivedFundRef.current = status.FETCHED;
      dispatchNotifications({
        payload: receivedFunds,
        type: 'SET_RECEIVED_FUNDS'
      });
    }
  }, [accounts, chains, isReceivedFundsEnable]);

  // Fetch staking rewards notifications
  const payoutsInfo = useCallback(async () => {
    if (isGettingPayoutsRef.current === status.NONE && accounts && stakingRewardChains && stakingRewardChains.length !== 0) {
      isGettingPayoutsRef.current = status.FETCHING;

      const payouts = await getPayoutsInformation(accounts, stakingRewardChains);

      isGettingPayoutsRef.current = status.FETCHED;
      dispatchNotifications({
        payload: payouts,
        type: 'SET_STAKING_REWARDS'
      });
    }
  }, [accounts, stakingRewardChains]);

  // Fetch referenda notifications
  const referendasInfo = useCallback(async () => {
    if (isGettingNotificationsRef.current === status.NONE && accounts && governanceChains && governanceChains.length !== 0) {
      isGettingNotificationsRef.current = status.FETCHING;

      const referendas = await getReferendasInformation(governanceChains);

      isGettingNotificationsRef.current = status.FETCHED;
      dispatchNotifications({
        payload: referendas,
        type: 'SET_REFERENDA'
      });
    }
  }, [accounts, governanceChains]);

  // Load notifications from storage or initialize if first time
  useEffect(() => {
    if (notificationIsOff || initializedRef.current) {
      return;
    }

    const loadSavedNotifications = async () => {
      initializedRef.current = true;

      try {
        const savedNotifications = await getStorage(STORAGE_KEY.NOTIFICATIONS) as NotificationsType | undefined;

        savedNotifications
          ? dispatchNotifications({ payload: savedNotifications, type: 'LOAD_FROM_STORAGE' })
          : dispatchNotifications({ type: 'INITIALIZE' }); // will happen only for the first time
      } catch (error) {
        console.error('Failed to load saved notifications:', error);
      }
    };

    loadSavedNotifications().catch(console.error);
  }, [notificationIsOff]);

  // Fetch received funds and staking rewards notifications when settings change
  useEffect(() => {
    if (notificationIsOff) {
      return;
    }

    if (isReceivedFundsEnable) {
      receivedFunds().catch(console.error);
    } else {
      isGettingReceivedFundRef.current = status.FETCHED;
    }

    if (stakingRewardChains?.length !== 0) {
      payoutsInfo().catch(console.error);
    } else {
      isGettingPayoutsRef.current = status.FETCHED;
    }

    if (governanceChains?.length !== 0) {
      referendasInfo().catch(console.error);
    } else {
      isGettingNotificationsRef.current = status.FETCHED;
    }
  }, [governanceChains?.length, isReceivedFundsEnable, notificationIsOff, payoutsInfo, receivedFunds, referendasInfo, stakingRewardChains?.length]);

  // Save notifications to storage before window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const notificationIsInitializing = notifications.isFirstTime && notifications.referendas?.length === 0;

      if (!isSavingRef.current && !notificationIsInitializing) {
        isSavingRef.current = true;

        const dataToSave = notifications;

        dataToSave.latestLoggedIn = Math.floor(Date.now() / 1000); // timestamp in seconds

        setStorage(STORAGE_KEY.NOTIFICATIONS, dataToSave)
          .then(() => {
            console.log('Notifications saved successfully on unload.');
          })
          .catch((error) => {
            console.error('Failed to save notifications on unload:', error);
          });
      }
    };

    // Add event listener for the 'beforeunload' event
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [notifications]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     // ✅ This runs only after the component has been mounted for 5 seconds
  //     markAsRead();
  //   }, 5000);

  //   return () => clearTimeout(timer); // cleanup if the component unmounts
  // }, [markAsRead]);

  const notificationItems = useMemo(() => groupNotificationsByDay(notifications.notificationMessages), [notifications.notificationMessages]);

  const isNotificationOff = useMemo(() => !notificationSetting.enable && !notifications.isFirstTime, [notificationSetting.enable, notifications.isFirstTime]);
  const isFirstTime = useMemo(() => notificationSetting.enable && notifications.isFirstTime, [notificationSetting.enable, notifications.isFirstTime]);

  const loading = useMemo(() => {
    if (isNotificationOff || isFirstTime || (notificationItems && Object.entries(notificationItems).length > 0)) {
      return false;
    }

    return true;
  }, [isFirstTime, isNotificationOff, notificationItems]);

  return {
    markAsRead,
    notificationItems,
    notificationSetting,
    notifications,
    status: {
      isFirstTime,
      isNotificationOff,
      loading
    }
  };
}
