// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationSettingType } from '../popup/notification/NotificationSettings';
import type { NotificationActionType, NotificationsType, WorkerMessage } from '../popup/notification/types';
import type { DropdownOption } from '../util/types';

import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { AccountContext } from '../components';
import { getStorage, setStorage } from '../components/Loading';
import { DEFAULT_NOTIFICATION_SETTING, KUSAMA_NOTIFICATION_CHAIN, MAX_ACCOUNT_COUNT_NOTIFICATION, SUBSCAN_SUPPORTED_CHAINS } from '../popup/notification/constant';
import { getPayoutsInformation, getReceivedFundsInformation } from '../popup/notification/helpers';
import { generateReceivedFundNotifications, generateReferendaNotifications, generateStakingRewardNotifications, groupNotificationsByDay, markMessagesAsRead, updateReferendas } from '../popup/notification/util';
import { sanitizeChainName } from '../util';
import { KUSAMA_GENESIS_HASH, STORAGE_KEY } from '../util/constants';
import { useWorker } from './useWorker';
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
      const chainName = action.payload[0].chainName;
      const anyAvailableRefs = state.referendas?.find(({ chainName: network }) => network === chainName);

      return {
        ...state,
        isFirstTime: false,
        notificationMessages: anyAvailableRefs
          ? [...generateReferendaNotifications(KUSAMA_NOTIFICATION_CHAIN, state.referendas, action.payload), ...(state.notificationMessages ?? [])]
          : state.notificationMessages,
        referendas: updateReferendas(state.referendas, action.payload, chainName)
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
 * - `markAsRead`: A function to mark all notifications as read.
 * - `notifications`: The current notifications state.
 *
 * @remarks
 * This hook uses several internal flags and refs to avoid duplicate network calls and redundant state updates.
 */
export default function useNotifications () {
  const worker = useWorker();
  const selectedChains = useSelectedChains();
  const allChains = useGenesisHashOptions(false);
  const { accounts } = useContext(AccountContext);

  // Refs to avoid duplicate network calls and redundant state updates
  const isGettingReceivedFundRef = useRef<status>(status.NONE); // Flag to avoid duplicate calls of getReceivedFundsInformation
  const isGettingPayoutsRef = useRef<status>(status.NONE); // Flag to avoid duplicate calls of getPayoutsInformation
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

  const [settings, setSettings] = useState<NotificationSettingType | undefined>();
  const [defaultSettingFlag, setDefaultSettingFlag] = useState<boolean>(false);
  const [notifications, dispatchNotifications] = useReducer(notificationReducer, initialNotificationState);

  // Whether notifications are turned off
  const notificationIsOff = useMemo(() => !settings || settings.enable === false || settings.accounts?.length === 0, [settings]);

  // Mark all notifications as read
  const markAsRead = useCallback(() => {
    dispatchNotifications({ type: 'MARK_AS_READ' });
  }, []);

  // Fetch received funds notifications
  const receivedFunds = useCallback(async () => {
    if (chains && isGettingReceivedFundRef.current === status.NONE && settings?.accounts && settings.receivedFunds) {
      isGettingReceivedFundRef.current = status.FETCHING;

      // Filter supported chains for Subscan
      const filteredSupportedChains = chains.filter(({ text }) => {
        const sanitized = sanitizeChainName(text)?.toLowerCase();

        if (!sanitized) {
          return false;
        }

        return SUBSCAN_SUPPORTED_CHAINS.find((chainName) => chainName.toLowerCase() === sanitized);
      }).map(({ value }) => value as string);

      const receivedFunds = await getReceivedFundsInformation(settings.accounts, filteredSupportedChains);

      isGettingReceivedFundRef.current = status.FETCHED;
      dispatchNotifications({
        payload: receivedFunds,
        type: 'SET_RECEIVED_FUNDS'
      });
    }
  }, [chains, settings?.accounts, settings?.receivedFunds]);

  // Fetch staking rewards notifications
  const payoutsInfo = useCallback(async () => {
    if (isGettingPayoutsRef.current === status.NONE && settings?.accounts && settings.stakingRewards && settings.stakingRewards.length !== 0) {
      isGettingPayoutsRef.current = status.FETCHING;

      const payouts = await getPayoutsInformation(settings.accounts, settings.stakingRewards);

      isGettingPayoutsRef.current = status.FETCHED;
      dispatchNotifications({
        payload: payouts,
        type: 'SET_STAKING_REWARDS'
      });
    }
  }, [settings?.accounts, settings?.stakingRewards]);

  // Load notification settings from storage on mount
  useEffect(() => {
    const getSettings = async () => {
      const savedSettings = await getStorage(STORAGE_KEY.NOTIFICATION_SETTINGS) as NotificationSettingType;

      if (!savedSettings) {
        setDefaultSettingFlag(true);

        return;
      }

      setSettings(savedSettings);
    };

    getSettings().catch(console.error);
  }, []);

  // If no settings, set default settings using current accounts
  useEffect(() => {
    if (!defaultSettingFlag) {
      return;
    }

    const addresses = accounts.map(({ address }) => address).slice(0, MAX_ACCOUNT_COUNT_NOTIFICATION);

    setSettings({
      ...DEFAULT_NOTIFICATION_SETTING, // accounts is an empty array in the constant file
      accounts: addresses // This line fills the empty accounts array with random address from the extension
    });
  }, [accounts, defaultSettingFlag]);

  // Load notifications from storage or initialize if first time
  useEffect(() => {
    if (notificationIsOff || !settings || initializedRef.current) {
      return;
    }

    const loadSavedNotifications = async () => {
      initializedRef.current = true;

      try {
        const savedNotifications = await getStorage(STORAGE_KEY.NOTIFICATIONS) as NotificationsType | undefined;

        savedNotifications
          ? dispatchNotifications({ payload: { ...savedNotifications, latestLoggedIn: 1709643091 }, type: 'LOAD_FROM_STORAGE' })
          : dispatchNotifications({ type: 'INITIALIZE' }); // will happen only for the first time
      } catch (error) {
        console.error('Failed to load saved notifications:', error);
      }
    };

    loadSavedNotifications().catch(console.error);
  }, [notificationIsOff, settings]);

  // Listen for governance-related notifications from the worker
  useEffect(() => {
    if (notificationIsOff || settings?.governance?.length === 0) {
      return;
    }

    // Handle messages from the worker
    const handelMessage = (event: MessageEvent<string>) => {
      try {
        if (!event.data) {
          return;
        }

        const parsedMessage = JSON.parse(event.data) as WorkerMessage;

        if (parsedMessage.functionName !== STORAGE_KEY.NOTIFICATIONS) {
          return;
        }

        const { message } = parsedMessage;

        if (message.type !== 'referenda') {
          return;
        }

        const { chainGenesis, data } = message;

        if (settings?.governance?.find((value) => value === chainGenesis)) {
          const chainName = chainGenesis === KUSAMA_GENESIS_HASH ? 'kusama' : 'polkadot';
          const payload = data.map((item) => ({ ...item, chainName }));

          dispatchNotifications({
            payload,
            type: 'SET_REFERENDA'
          });
        }
      } catch (error) {
        console.error('Error processing worker message:', error);
      }
    };

    worker.addEventListener('message', handelMessage);

    return () => {
      worker.removeEventListener('message', handelMessage);
    };
  }, [notificationIsOff, settings?.governance, worker]);

  // Fetch received funds and staking rewards notifications when settings change
  useEffect(() => {
    if (notificationIsOff || !settings) {
      return;
    }

    if (settings.receivedFunds) {
      receivedFunds().catch(console.error);
    } else {
      isGettingReceivedFundRef.current = status.FETCHED;
    }

    if (settings.stakingRewards?.length !== 0) {
      payoutsInfo().catch(console.error);
    }
  }, [notificationIsOff, payoutsInfo, receivedFunds, settings]);

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

  const notificationItems = useMemo(() => groupNotificationsByDay(notifications.notificationMessages), [notifications.notificationMessages]);

  return {
    markAsRead,
    notificationItems,
    notifications
  };
}
