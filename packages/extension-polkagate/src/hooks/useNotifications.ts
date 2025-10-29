// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationActionType, NotificationMessage, NotificationMessageType, NotificationsType } from '../popup/notification/types';
import type { DropdownOption } from '../util/types';

import { useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import { CurrencyContext } from '../components';
import { getStorage, setStorage } from '../components/Loading';
import { useUserAddedEndpoints } from '../fullscreen/addNewChain/utils';
import { AUTO_MARK_AS_READ_DELAY, initialNotificationState, SUBSCAN_SUPPORTED_CHAINS } from '../popup/notification/constant';
import { getPayoutsInformation, getReceivedFundsInformation, getReferendasInformation } from '../popup/notification/helpers';
import useNotificationSettings from '../popup/notification/hook/useNotificationSettings';
import { filterMessages, generateReceivedFundNotifications, generateReferendaNotifications, generateStakingRewardNotifications, getChainInfo, getNotificationMessages, getTokenPriceBySymbol, groupNotificationsByDay, markMessagesAsRead } from '../popup/notification/util';
import { sanitizeChainName } from '../util';
import { STORAGE_KEY } from '../util/constants';
import { useGenesisHashOptions, usePrices, useSelectedChains, useTranslation } from '.';

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
        notificationMessages: []
      };

    case 'MARK_AS_READ':
      // Mark all messages as read
      return { ...state, notificationMessages: markMessagesAsRead(state.notificationMessages ?? []) };

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    case 'SET_MESSAGES':
      return { ...state, notificationMessages: filterMessages(state.notificationMessages, action.payload) };

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
  const { t } = useTranslation();
  const { currency } = useContext(CurrencyContext);
  const useAddedEndpoints = useUserAddedEndpoints();
  const prices = usePrices();

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
      .map(({ text, value }) => ({ text, value } as DropdownOption))
      .filter(({ text }) => {
        const sanitized = sanitizeChainName(text)?.toLowerCase();

        if (!sanitized) {
          return false;
        }

        return SUBSCAN_SUPPORTED_CHAINS.find((chainName) => chainName.toLowerCase() === sanitized);
      }).map(({ value }) => value as string);
  }, [allChains, selectedChains]);

  const [notifications, dispatchNotifications] = useReducer(notificationReducer, initialNotificationState);

  // const latestLoggedIn = useMemo(() => notifications?.latestLoggedIn ?? Math.floor(Date.now() / 1000), [notifications?.latestLoggedIn]);
  const latestLoggedIn = 1760566665; // 1761566665
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
      const notificationMessages: NotificationMessage[] = [];

      for (const chain of chains) {
        const chainInfo = getChainInfo(chain);
        const tokenPrice = getTokenPriceBySymbol(chainInfo.token, chainInfo.chainName, chain, prices, useAddedEndpoints);

        const receivedFundsRes = await getReceivedFundsInformation(accounts, chain);
        const newMessages: NotificationMessageType[] = generateReceivedFundNotifications(latestLoggedIn, receivedFundsRes);
        const messages = newMessages.map((message) => getNotificationMessages(message, chainInfo, currency, tokenPrice, t));

        notificationMessages.push(...messages);
      }

      fetchRefs.receivedFundsRef = status.FETCHED;
      dispatchNotifications({ payload: notificationMessages, type: 'SET_MESSAGES' });
    }
  }, [accounts, chains, currency, fetchRefs, isReceivedFundsEnable, latestLoggedIn, prices, t, useAddedEndpoints]);

  // Fetch staking rewards notifications
  const payoutsInfo = useCallback(async () => {
    if (fetchRefs.stakingRewardsRef === status.NONE && accounts && stakingRewardChains && stakingRewardChains.length !== 0) {
      fetchRefs.stakingRewardsRef = status.FETCHING;
      const notificationMessages: NotificationMessage[] = [];

      for (const chain of stakingRewardChains) {
        const chainInfo = getChainInfo(chain);
        const tokenPrice = getTokenPriceBySymbol(chainInfo.token, chainInfo.chainName, chain, prices, useAddedEndpoints);

        const payouts = await getPayoutsInformation(accounts, chain);
        const newMessages: NotificationMessageType[] = generateStakingRewardNotifications(latestLoggedIn, payouts);
        const messages = newMessages.map((message) => getNotificationMessages(message, chainInfo, currency, tokenPrice, t));

        notificationMessages.push(...messages);
      }

      fetchRefs.stakingRewardsRef = status.FETCHED;
      dispatchNotifications({ payload: notificationMessages, type: 'SET_MESSAGES' });
    }
  }, [accounts, currency, fetchRefs, latestLoggedIn, prices, stakingRewardChains, t, useAddedEndpoints]);

  // Fetch referenda notifications
  const referendasInfo = useCallback(async () => {
    if (fetchRefs.referendaRef === status.NONE && accounts && governanceChains && governanceChains.length !== 0) {
      fetchRefs.referendaRef = status.FETCHING;
      const notificationMessages: NotificationMessage[] = [];

      for (const chain of governanceChains) {
        const chainInfo = getChainInfo(chain);
        const tokenPrice = getTokenPriceBySymbol(chainInfo.token, chainInfo.chainName, chain, prices, useAddedEndpoints);

        const referendas = await getReferendasInformation(chain);
        const newMessages: NotificationMessageType[] = generateReferendaNotifications(latestLoggedIn, referendas);
        const messages = newMessages.map((message) => getNotificationMessages(message, chainInfo, currency, tokenPrice, t));

        notificationMessages.push(...messages);
      }

      fetchRefs.referendaRef = status.FETCHED;
      dispatchNotifications({ payload: notificationMessages, type: 'SET_MESSAGES' });
    }
  }, [accounts, currency, fetchRefs, governanceChains, prices, t, useAddedEndpoints]);

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

    const fetchSequentially = async () => {
      try {
        if (isReceivedFundsEnable) {
          await receivedFundsInfo();
        }

        if (stakingRewardChains?.length) {
          await payoutsInfo();
        }

        if (governanceChains?.length) {
          await referendasInfo();
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSequentially().catch(console.error);
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
