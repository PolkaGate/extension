// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { getStorage, setStorage } from '../components/Loading';
import { REFERENDA_COUNT_TO_TRACK_DOT, REFERENDA_COUNT_TO_TRACK_KSM } from '../popup/notification/constant';
import { useWorker } from './useWorker';

interface WorkerMessage {
  functionName: string;
  message: {
    type: 'referenda';
    chainName: string;
    data: { refId: number; refStatus: string; }[];
  }
}

const NOTIFICATIONS = 'notifications';

export interface ReferendaNotificationType {
  read?: boolean;
  status?: string;
  refId?: number;
}

export interface NotificationsType {
  kusamaReferenda: ReferendaNotificationType[] | null | undefined;
  polkadotReferenda: ReferendaNotificationType[] | null | undefined;
  receivedFunds: {
    address: string;
    amount: number;
    date?: number;
    chainName: string;
    read: boolean;
  }[] | null | undefined;
  latestLoggedIn: number | undefined;
  isFirstTime: boolean | undefined;
}

type NotificationActionType =
  | { type: 'INITIALIZE'; }
  | { type: 'CHECK_FIRST_TIME'; }
  | { type: 'SET_KUSAMA_REF'; payload: ReferendaNotificationType[] }
  | { type: 'SET_POLKADOT_REF'; payload: ReferendaNotificationType[] }
  | { type: 'SET_RECEIVED_FUNDS'; payload: NotificationsType['receivedFunds'] };

const initialNotificationState: NotificationsType = {
  isFirstTime: undefined,
  kusamaReferenda: undefined,
  latestLoggedIn: Date.now(),
  polkadotReferenda: undefined,
  receivedFunds: undefined
};

const notificationReducer = (
  state: NotificationsType,
  action: NotificationActionType
): NotificationsType => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isFirstTime: true, kusamaReferenda: null, polkadotReferenda: null, receivedFunds: null };
    case 'CHECK_FIRST_TIME':
      return { ...state, isFirstTime: true };
    case 'SET_KUSAMA_REF':
      return { ...state, isFirstTime: false, kusamaReferenda: action.payload };
    case 'SET_POLKADOT_REF':
      return { ...state, isFirstTime: false, polkadotReferenda: action.payload };
    case 'SET_RECEIVED_FUNDS':
      return { ...state, isFirstTime: false, receivedFunds: action.payload };
    default:
      return state;
  }
};

export default function useNotifications() {
  const worker = useWorker();

  const isSavingRef = useRef(false); // Flag to avoid duplicate saves
  const kusamaRefUpdated = useRef(false); // Kusama ref updated flag
  const polkadotRefUpdated = useRef(false); // polkadot ref updated flag

  const [notifications, dispatchNotifications] = useReducer(notificationReducer, initialNotificationState);
  const [savedNotificationsInfo, setSavedNotificationsInfo] = useState<NotificationsType | null | undefined>(undefined); // null - occurs the first time, when no data is yet saved in storage
  const [fetchedNotificationsInfo, dispatchFetchedNotifications] = useReducer(notificationReducer, initialNotificationState);

  const checkForNewNotifications = useCallback((fetchedNotifications: ReferendaNotificationType[], savedNotifications: ReferendaNotificationType[]) => {
    // Logic to determine if there are genuinely new notifications
    // This could compare fetchedNotifications with savedNotifications
    // based on specific criteria like refId, status, etc.
    const hasNewNotifications = fetchedNotifications.some((fetchedNotif) =>
      !savedNotifications.some((savedNotif) =>
        savedNotif.refId === fetchedNotif.refId ||
        (savedNotif.refId === fetchedNotif.refId && savedNotif.status === fetchedNotif.status)
      ));

    return hasNewNotifications;
  }, []);

  const prepareToSave = useCallback((fetchedArray: ReferendaNotificationType[], savedArray: ReferendaNotificationType[], notificationArray: ReferendaNotificationType[] | null | undefined, chainName: string) => {
    const count = chainName === 'polkadot'
      ? REFERENDA_COUNT_TO_TRACK_DOT
      : REFERENDA_COUNT_TO_TRACK_KSM;

    const uniqueReferendas = Array.from(new Map([...savedArray, ...fetchedArray].map((item) => [item.refId, item])).values())
      .sort((a, b) => (a.refId ?? 0) - (b.refId ?? 0))
      .slice(0, count);

    const updatedReferendas = uniqueReferendas.map((uniqueItem) => {
      const found = notificationArray?.find(({ refId }) => refId === uniqueItem.refId);

      // const anythingNew = JSON.stringify(found) === JSON.stringify(uniqueItem);

      return found
        // ? { ...uniqueItem, read: anythingNew }
        ? { ...uniqueItem, read: found.read }
        : uniqueItem;
    });

    return updatedReferendas;
  }, []);

  useEffect(() => {
    if (savedNotificationsInfo === null) { // when no notification has been saved yet
      dispatchNotifications({ type: 'INITIALIZE' });

      return;
    }

    const noNewInfoFetchedYet = Object.values(fetchedNotificationsInfo).every((info) => info === undefined);

    if (savedNotificationsInfo === undefined || noNewInfoFetchedYet) {
      return;
    }

    if (fetchedNotificationsInfo.kusamaReferenda && checkForNewNotifications(fetchedNotificationsInfo.kusamaReferenda, savedNotificationsInfo?.kusamaReferenda ?? [])) {
      const updatedKusamaReferenda = prepareToSave(fetchedNotificationsInfo.kusamaReferenda ?? [], savedNotificationsInfo?.kusamaReferenda ?? [], notifications.kusamaReferenda, 'kusama');

      if (!kusamaRefUpdated.current) {
        kusamaRefUpdated.current = true;

        dispatchNotifications({
          payload: updatedKusamaReferenda,
          type: 'SET_KUSAMA_REF'
        });
      }
    }

    if (fetchedNotificationsInfo.polkadotReferenda && checkForNewNotifications(fetchedNotificationsInfo.polkadotReferenda, savedNotificationsInfo?.polkadotReferenda ?? [])) {
      const updatedPolkadotReferenda = prepareToSave(fetchedNotificationsInfo.polkadotReferenda ?? [], savedNotificationsInfo?.polkadotReferenda ?? [], notifications.polkadotReferenda, 'polkadot');

      if (!polkadotRefUpdated.current) {
        polkadotRefUpdated.current = true;

        dispatchNotifications({
          payload: updatedPolkadotReferenda,
          type: 'SET_POLKADOT_REF'
        });
      }
    }
  }, [checkForNewNotifications, fetchedNotificationsInfo, notifications?.isFirstTime, notifications.kusamaReferenda, notifications.polkadotReferenda, prepareToSave, savedNotificationsInfo]);

  const loadSavedNotifications = useCallback(async () => {
    try {
      const savedNotifications = await getStorage(NOTIFICATIONS) as NotificationsType;

      console.info('savedNotifications ::: savedNotifications', savedNotifications);

      setSavedNotificationsInfo(savedNotifications ?? null); // null - will happen only for the first time
      (!savedNotifications || savedNotifications?.isFirstTime) && dispatchNotifications({ type: 'CHECK_FIRST_TIME' });
    } catch (error) {
      console.error('Failed to load saved notifications:', error);
    }
  }, []);

  useEffect(() => {
    loadSavedNotifications().catch(console.error);
  }, [loadSavedNotifications]);

  useEffect(() => {
    const handelMessage = (event: MessageEvent<string>) => {
      try {
        if (!event.data) {
          return;
        }

        const parsedMessage = JSON.parse(event.data) as WorkerMessage;

        if (parsedMessage.functionName !== NOTIFICATIONS) {
          return;
        }

        const { message } = parsedMessage;

        switch (message.type) {
          case 'referenda':
            {
              const { chainName, data } = message;

              dispatchFetchedNotifications({
                payload: data,
                type: chainName === 'kusama' ? 'SET_KUSAMA_REF' : 'SET_POLKADOT_REF'
              });
            }

            break;
        }
      } catch (error) {
        console.error('Error processing worker message:', error);
      }
    };

    worker.addEventListener('message', handelMessage);

    return () => {
      worker.removeEventListener('message', handelMessage);
    };
  }, [worker]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isSavingRef.current && savedNotificationsInfo !== undefined) {
        isSavingRef.current = true;

        let dataToSave = null;

        const fetched = Boolean(fetchedNotificationsInfo.kusamaReferenda || fetchedNotificationsInfo.polkadotReferenda || fetchedNotificationsInfo.receivedFunds);

        if (savedNotificationsInfo && !savedNotificationsInfo.isFirstTime) {
          dataToSave = notifications;
        } else {
          if (fetched) {
            dataToSave = fetchedNotificationsInfo;
            dataToSave.kusamaReferenda?.forEach((item) => {
              item.read = true;
            });
            dataToSave.polkadotReferenda?.forEach((item) => {
              item.read = true;
            });
            dataToSave.receivedFunds?.forEach((item) => {
              item.read = true;
            });
            dataToSave.isFirstTime = true;
          }
        }

        console.info('dataToSave ::: dataToSave', dataToSave);

        setStorage(NOTIFICATIONS, dataToSave)
          .then(() => {
            console.log('Notifications saved successfully on unload.');
          })
          .catch((error) => {
            console.error('Failed to save notifications on unload:', error);
          })
          .finally(() => {
            isSavingRef.current = false;
          });
      }
    };

    // Add event listener for the 'beforeunload' event
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchedNotificationsInfo, notifications, savedNotificationsInfo]);

  return notifications;
}
