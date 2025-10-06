// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '../../util/types';
import type { NotificationMessageType, NotificationType, ReceivedFundInformation, ReferendaNotificationType, StakingRewardInformation } from './types';

import { ArrowCircleDown, ArrowDown3, Award, Receipt2 } from 'iconsax-react';

import { useChainInfo, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

export function timestampToDate (timestamp: number | string, format: 'full' | 'short' | 'relative' = 'full'): string {
  // Ensure timestamp is a number and convert if it's a string
  const timestampNum = Number(timestamp);

  // Check if timestamp is valid
  if (isNaN(timestampNum)) {
    return 'Invalid Timestamp';
  }

  // Create a Date object (multiply by 1000 if it's a Unix timestamp in seconds)
  const date = new Date(timestampNum * 1000);

  // Different formatting options
  switch (format) {
    case 'full':
      return date.toLocaleString('en-US', {
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        month: 'long',
        second: '2-digit'
      });

    case 'short':
      return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short'
      });

    case 'relative':
      return getRelativeTime(date);

    default:
      return date.toLocaleString();
  }
}

// Helper function to get relative time
function getRelativeTime (date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 }
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);

    if (value >= 1) {
      return value === 1
        ? `1 ${unit.name} ago`
        : `${value} ${unit.name}s ago`;
    }
  }

  return diffInSeconds <= 0 ? 'just now' : `${diffInSeconds} seconds ago`;
}

/**
 * Generates notifications for new or updated referenda
 * @param chainName - Name of the blockchain network
 * @param previousReferenda - Previous state of referenda
 * @param currentReferenda - Current state of referenda
 * @returns Array of new notification messages
 */
export const generateReferendaNotifications = (
  chain: DropdownOption,
  previousReferenda: ReferendaNotificationType[] | null | undefined,
  currentReferenda: ReferendaNotificationType[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];

  // Find new referenda (not in previous state)
  const newReferenda = currentReferenda.filter(
    (current) => !previousReferenda?.some(
      (previous) => previous.refId === current.refId && previous.chainName === current.chainName
    )
  );

  // Find referenda with status changes
  const updatedReferenda = currentReferenda.filter(
    (current) => previousReferenda?.some(
      (previous) =>
        previous.refId === current.refId &&
        previous.chainName === current.chainName &&
        previous.status !== current.status
    )
  );

  // Generate notifications for new referenda
  newReferenda.forEach((referenda) => {
    newMessages.push({
      chain,
      read: false,
      referenda,
      type: 'referenda'
    });
  });

  // Generate notifications for referenda with status changes
  updatedReferenda.forEach((referenda) => {
    newMessages.push({
      chain,
      read: false,
      referenda,
      type: 'referenda'
    });
  });

  return newMessages;
};

/**
 * Generates notifications for new staking rewards
 * @param currentReferenda - Current state of referenda
 * @returns Array of new notification messages
 */
export const generateStakingRewardNotifications = (
  latestLoggedIn: number,
  payouts: StakingRewardInformation[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];
  const newPayouts = payouts.map(({ address, data, network }) => {
    const payout = data.find(({ timestamp }) => timestamp >= latestLoggedIn);

    return payout
      ? {
        address,
        network,
        payout
      }
      : undefined;
  }).filter((item) => !!item);

  // Generate notifications for new payouts
  newPayouts.forEach(({ address, network, payout }) => {
    newMessages.push({
      chain: network,
      forAccount: address,
      payout,
      read: false,
      type: 'stakingReward'
    });
  });

  return newMessages;
};

/**
 * Generates notifications for new staking rewards
 * @param currentReferenda - Current state of referenda
 * @returns Array of new notification messages
 */
export const generateReceivedFundNotifications = (
  latestLoggedIn: number,
  transfers: ReceivedFundInformation[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];
  const newReceivedFunds = transfers.map(({ address, data, network }) => {
    const receivedFund = data.find(({ timestamp }) => timestamp >= latestLoggedIn);

    return receivedFund
      ? {
        address,
        network,
        receivedFund
      }
      : undefined;
  }).filter((item) => !!item);

  // Generate notifications for new payouts
  newReceivedFunds.forEach(({ address, network, receivedFund }) => {
    newMessages.push({
      chain: network,
      forAccount: address,
      read: false,
      receivedFund,
      type: 'receivedFund'
    });
  });

  return newMessages;
};

/**
 * Marks messages as read
 * @param messages - Notification messages
 * @returns Array of new notification messages
 */
export const markMessagesAsRead = (messages: NotificationMessageType[]) => {
  return messages.map((message) => (
    {
      ...message,
      read: true
    }
  ));
};

export const updateReferendas = (preciousRefs: ReferendaNotificationType[] | null | undefined, newRefs: ReferendaNotificationType[], network: string) => {
  const filterOut = preciousRefs?.filter(({ chainName }) => chainName.toLowerCase() !== network.toLowerCase());

  return (filterOut ?? []).concat(newRefs);
};

// Utility to get date string like "15 Dec 2025"
function getDayKey (timestamp: number): string {
  const date = new Date(timestamp * 1000); // convert seconds → ms

  // Format: "15 Dec 2025"
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function groupNotificationsByDay (
  notifications: NotificationMessageType[] | undefined
): Record<string, NotificationMessageType[]> | undefined {
  const seen = new Set(); // to avoid duplicates globally

  if (!notifications) {
    return;
  }

  const grouped = notifications.reduce<Record<string, NotificationMessageType[]>>((acc, item) => {
    let timestamp: number | undefined;
    let uniqueKey = '';

    switch (item.type) {
      case 'stakingReward':
        timestamp = item.payout?.timestamp;
        uniqueKey = `${item.read}-${JSON.stringify(item.payout)}`;

        break;
      case 'receivedFund':
        timestamp = item.receivedFund?.timestamp;
        uniqueKey = `${item.read}-${JSON.stringify(item.receivedFund)}`;

        break;
      // case 'referenda':
      //   timestamp = item.referenda?.timestamp;
      //   break;
    }

    if (!timestamp || seen.has(uniqueKey)) {
      return acc;
    }

    const dayKey = getDayKey(timestamp);

    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }

    acc[dayKey].push(item);
    seen.add(uniqueKey);

    return acc;
  }, {});

  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    // Parse your "15 Dec 2025" strings back into Date objects for sorting
    const dateA = new Date(a);
    const dateB = new Date(b);

    return dateB.getTime() - dateA.getTime(); // newest first
  });

  // Convert sorted entries back into a Record
  const sortedGrouped: Record<string, NotificationMessageType[]> = Object.fromEntries(sortedEntries);

  return sortedGrouped;
}

/**
 * Check if a given date string (formatted as "17 Dec 2024")
 * represents today's date.
 *
 * @param dateString - The date string in format "DD Mon YYYY"
 * @returns true if the date is today's date, otherwise false
 */
export function isToday (dateString: string): boolean {
  const today = new Date();
  const todayString = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return dateString === todayString;
}

/**
 * Converts a timestamp (in seconds) to a formatted local time string like "10:01 am".
 *
 * @param timestamp - The UNIX timestamp in seconds
 * @returns A formatted time string (e.g., "10:01 am")
 */
export function getTimeOfDay (timestamp: number): string {
  // Convert timestamp from seconds → milliseconds
  const date = new Date(timestamp * 1000);

  // Format time as "10:01 am" or "9:45 pm"
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    hour12: true, // Use 12-hour format with am/pm
    minute: '2-digit'
  }).toLowerCase(); // optional: make "AM"/"PM" lowercase
}

export function getNotificationItemTitle (type: NotificationType, referenda?: ReferendaNotificationType) {
  const { t } = useTranslation();

  switch (type) {
    case 'receivedFund':
      return t('New Fund Received');

    case 'referenda':
      if (referenda?.status === 'approved') {
        return t('Referendum approved');
      } else if (referenda?.status === 'ongoing') {
        return t('New Referendum');
      } else if (referenda?.status === 'cancelled') {
        return t('Referendum Cancelled');
      } else if (referenda?.status === 'timedOut') {
        return t('Referendum time outed');
      } else {
        return t('Referendum Rejected');
      }

    case 'stakingReward':
      return t('New Reward');

    default:
      return t('Update');
  }
}

export function getNotificationDescription (item: NotificationMessageType) {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(item.chain?.value as string ?? '', true);

  switch (item.type) {
    case 'receivedFund':
      return {
        text: t('Received 0.1 DOT ($1.23) on {{chainName}}', { replace: { chainName } }),
        textInColor: item.extrinsicIndex // TODO
      };

    case 'referenda': {
      const statusMap: Record<string, string> = {
        approved: t('{{chainName}} referendum {{refId}} has been approved'),
        cancelled: t('{{chainName}} referendum {{refId}} has been cancelled'),
        ongoing: t('{{chainName}} referendum {{refId}} has been created'),
        rejected: t('{{chainName}} referendum {{refId}} has been rejected'),
        timedOut: t('{{chainName}} referendum {{refId}} has timed out')
      };

      const status = item.referenda?.status;
      const refId = item.referenda?.refId;
      // Default to "rejected" text if status is missing
      const textTemplate = statusMap[status ?? 'rejected'];

      return {
        text: t(textTemplate, {
          replace: { chainName, refId }
        }),
        textInColor: refId
      };
    }

    case 'stakingReward':
      return {
        text: t('Received 0.1 DOT ($1.23) from {{chainName}} staking', { replace: { chainName } }),
        textInColor: item.extrinsicIndex // TODO
      };
  }
}

export function getNotificationIcon (item: NotificationMessageType) {
  switch (item.type) {
    case 'receivedFund':
      return { ItemIcon: ArrowDown3, bgcolor: '#06D7F64D', borderColor: '#06D7F680', color: '#06D7F6' };

    case 'referenda': {
      const neutralStyle = { ItemIcon: Receipt2, bgcolor: '#303045', borderColor: '#222236', color: '#696D7E' };

      const statusMap = {
        approved: { ItemIcon: Receipt2, bgcolor: '#FF4FB91A', borderColor: '#FF4FB940', color: '#FF4FB9' },
        cancelled: neutralStyle,
        ongoing: { ItemIcon: Receipt2, bgcolor: '#82FFA540', borderColor: '#82FFA51A', color: '#82FFA5' },
        rejected: neutralStyle,
        timedOut: neutralStyle
      };

      const status = item.referenda?.status;

      return statusMap[status ?? 'rejected'] ?? neutralStyle;
    }

    case 'stakingReward':
      return { ItemIcon: Award, bgcolor: '#277DFF4D', borderColor: '#2A4FA680', color: '#74A4FF' };
  }
}
