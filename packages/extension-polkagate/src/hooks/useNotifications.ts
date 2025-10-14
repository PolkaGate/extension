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
        receivedFunds: undefined,
        referendas: undefined,
        stakingRewards: undefined
      };

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
 * @param [justLoadData=true] - If true the hook will only read the local storage and return it (fetching won't happen)
 *
 * @returns An object containing:
 * - `notifications`: The current notifications state.
 * - `notificationItems`: The current notification messages state.
 * - `settings`: The current notifications settings.
 *
 * @remarks
 * This hook uses several internal flags and refs to avoid duplicate network calls and redundant state updates.
 */
export default function useNotifications (justLoadData = true) {
  const { notificationSetting } = useNotificationSettings(justLoadData);
  const { accounts, enable: isNotificationEnable, governance: governanceChains, receivedFunds: isReceivedFundsEnable, stakingRewards: stakingRewardChains } = notificationSetting;

  const selectedChains = useSelectedChains();
  const allChains = useGenesisHashOptions(false);

  // Refs to avoid duplicate network calls and redundant state updates
  const { current: fetchRefs } = useRef({
    receivedFundsRef: status.NONE, // Flag to avoid duplicate calls of getReceivedFundsInformation
    referendaRef: status.NONE, // Flag to avoid duplicate calls of getPayoutsInformation
    stakingRewardsRef: status.NONE // Flag to avoid duplicate calls of getNotificationsInformation
  });
  const initializedRef = useRef<boolean>(false); // Flag to avoid duplicate initialization
  const isSavingRef = useRef<boolean>(false); // Flag to avoid duplicate save in the storage
  const saveQueue = useRef<Promise<void>>(Promise.resolve()); // Saving to the local storage queue

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

  useEffect(() => {
    // Don't save if notifications haven't been initialized yet
    if (notifications.isFirstTime === undefined) {
      return;
    }

    // Don't save if notifications are turned off
    if (notificationIsOff) {
      return;
    }

    // Queue saves to ensure they happen sequentially
    saveQueue.current = saveQueue.current.then(async () => {
      if (isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;
      const dataToSave = {
        ...notifications,
        latestLoggedIn: Math.floor(Date.now() / 1000)
      };

      try {
        await setStorage(STORAGE_KEY.NOTIFICATIONS, dataToSave);
        console.log('✅ Notifications saved to storage');
      } catch (error) {
        console.error('❌ Failed to save notifications:', error);
      } finally {
        isSavingRef.current = false;
      }
    });
  }, [notifications, notificationIsOff]);

  // Mark all notifications as read
  const markAsRead = useCallback(() => {
    const timer = setTimeout(() => {
      // ✅ This runs only after the component has been mounted for 5 seconds
      dispatchNotifications({ type: 'MARK_AS_READ' });
    }, AUTO_MARK_AS_READ_DELAY);

    return () => clearTimeout(timer); // return cleanup function if needed
  }, []);

  // Fetch received funds notifications
  const receivedFundsInfo = useCallback(async () => {
    if (chains && fetchRefs.receivedFundsRef === status.NONE && accounts && isReceivedFundsEnable) {
      fetchRefs.receivedFundsRef = status.FETCHING;

      // Filter supported chains for Subscan
      const filteredSupportedChains = chains.filter(({ text }) => {
        const sanitized = sanitizeChainName(text)?.toLowerCase();

        if (!sanitized) {
          return false;
        }

        return SUBSCAN_SUPPORTED_CHAINS.find((chainName) => chainName.toLowerCase() === sanitized);
      }).map(({ value }) => value as string);

      const receivedFunds = await getReceivedFundsInformation(accounts, filteredSupportedChains);

      fetchRefs.receivedFundsRef = status.FETCHED;
      dispatchNotifications({
        payload: receivedFunds,
        type: 'SET_RECEIVED_FUNDS'
      });
    }
  }, [accounts, chains, fetchRefs, isReceivedFundsEnable]);

  // Fetch staking rewards notifications
  const payoutsInfo = useCallback(async () => {
    if (fetchRefs.stakingRewardsRef === status.NONE && accounts && stakingRewardChains && stakingRewardChains.length !== 0) {
      fetchRefs.stakingRewardsRef = status.FETCHING;

      const payouts = await getPayoutsInformation(accounts, stakingRewardChains);

      fetchRefs.stakingRewardsRef = status.FETCHED;
      dispatchNotifications({
        payload: payouts,
        type: 'SET_STAKING_REWARDS'
      });
    }
  }, [accounts, fetchRefs, stakingRewardChains]);

  // Fetch referenda notifications
  const referendasInfo = useCallback(async () => {
    if (fetchRefs.referendaRef === status.NONE && accounts && governanceChains && governanceChains.length !== 0) {
      fetchRefs.referendaRef = status.FETCHING;

      const referendas = await getReferendasInformation(governanceChains);

      fetchRefs.referendaRef = status.FETCHED;
      dispatchNotifications({
        payload: referendas,
        type: 'SET_REFERENDA'
      });
    }
  }, [accounts, fetchRefs, governanceChains]);

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

  // Fetch received funds, referendas and staking rewards notifications
  useEffect(() => {
    if (notificationIsOff || justLoadData) {
      return;
    }

    if (isReceivedFundsEnable) {
      receivedFundsInfo().catch(console.error);
    }

    if (stakingRewardChains?.length !== 0) {
      payoutsInfo().catch(console.error);
    }

    if (governanceChains?.length !== 0) {
      referendasInfo().catch(console.error);
    }
  }, [governanceChains?.length, isReceivedFundsEnable, justLoadData, notificationIsOff, payoutsInfo, receivedFundsInfo, referendasInfo, stakingRewardChains?.length]);

  const notificationItems = useMemo(() => groupNotificationsByDay(notifications.notificationMessages), [notifications.notificationMessages]);

  const isNotificationOff = useMemo(() => !notificationSetting.enable && !notifications.isFirstTime, [notificationSetting.enable, notifications.isFirstTime]);
  const isFirstTime = useMemo(() => !notificationSetting.enable && notifications.isFirstTime, [notificationSetting.enable, notifications.isFirstTime]);
  const noNotificationYet = useMemo(() => notificationSetting.enable && !notifications.isFirstTime && notifications.notificationMessages?.length === 0, [notificationSetting.enable, notifications.isFirstTime, notifications.notificationMessages?.length]);

  const loading = useMemo(() => {
    if (isNotificationOff || isFirstTime || (notificationItems && Object.entries(notificationItems).length > 0) || noNotificationYet) {
      return false;
    }

    return true;
  }, [isFirstTime, isNotificationOff, noNotificationYet, notificationItems]);

  return {
    markAsRead,
    notificationItems,
    notificationSetting,
    notifications,
    status: {
      isFirstTime,
      isNotificationOff,
      loading,
      noNotificationYet
    }
  };
}
