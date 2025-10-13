// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-template-curly-in-string */

import type { TFunction } from '@polkagate/apps-config/types';
import type { CurrencyItemType } from '@polkadot/extension-polkagate/src/fullscreen/home/partials/type';
import type { ChainInfo } from '@polkadot/extension-polkagate/src/hooks/useChainInfo';
import type { Price } from '@polkadot/extension-polkagate/src/hooks/useTokenPriceBySymbol';
import type { NotificationMessageType, NotificationType, ReceivedFundInformation, ReferendaInformation, ReferendaProp, StakingRewardInformation } from './types';

import { ArrowDown3, Award, Receipt2 } from 'iconsax-react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { NOTIFICATION_TIMESTAMP_OFFSET } from './constant';

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
 * @param previousRefs - Previous state of referenda (by network)
 * @param newRefs - Current state of referenda (by network)
 * @returns Array of new notification messages
 */
export const generateReferendaNotifications = (
  latestLoggedIn: number,
  previousRefs: ReferendaInformation[] | null | undefined,
  newRefs: ReferendaInformation[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];

  for (const currentNetworkData of newRefs) {
    let { data: currentReferenda, network } = currentNetworkData;

    currentReferenda = currentReferenda.filter(({ latestTimestamp }) => latestTimestamp >= latestLoggedIn - NOTIFICATION_TIMESTAMP_OFFSET);

    const prevNetworkData = previousRefs?.find(
      (p) => p.network.value === network.value
    );

    const previousReferenda = prevNetworkData?.data ?? [];

    // Find new referenda (not in previous state)
    const newReferenda = currentReferenda.filter((current) =>
      !previousReferenda.some((prev) => prev.referendumIndex === current.referendumIndex)
    );

    // Find referenda with status changes
    const updatedReferenda = currentReferenda.filter(
      (current) =>
        previousReferenda.some(
          (prev) =>
            prev.referendumIndex === current.referendumIndex &&
            prev.status !== current.status
        )
    );

    // Generate notifications for new referenda
    for (const ref of newReferenda) {
      newMessages.push({
        chain: network,
        read: false,
        referenda: ref,
        type: 'referenda'
      });
    }

    // Generate notifications for referenda with status changes
    for (const ref of updatedReferenda) {
      newMessages.push({
        chain: network,
        read: false,
        referenda: ref,
        type: 'referenda'
      });
    }
  }

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
    const payout = data.find(({ timestamp }) => timestamp >= latestLoggedIn - NOTIFICATION_TIMESTAMP_OFFSET);

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
    const receivedFund = data.find(({ timestamp }) => timestamp >= latestLoggedIn - NOTIFICATION_TIMESTAMP_OFFSET);

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

/**
 * Merges two arrays of ReferendaInformation without duplicating existing referenda.
 * - Keeps previous referenda data
 * - Adds new referenda from the new state
 * - Preserves per-network separation
 */
export const updateReferendas = (preciousRefs: ReferendaInformation[] | null | undefined, newRefs: ReferendaInformation[]) => {
  if (!preciousRefs) {
    return newRefs;
  }

const resultMap = new Map<string | number, ReferendaInformation>();

  // Copy all previous data
  for (const prev of preciousRefs) {
    resultMap.set(prev.network.value, {
      data: [...prev.data],
      network: prev.network
    });
  }

  // Merge new data
  for (const current of newRefs) {
    const existing = resultMap.get(current.network.value);

    if (!existing) {
      // Entirely new network — just add it
      resultMap.set(current.network.value, current);
      continue;
    }

    const updatedData = [...existing.data];
    const existingIndexes = new Map(
      existing.data.map((r) => [r.referendumIndex, r])
    );

    for (const newRef of current.data) {
      const existingRef = existingIndexes.get(newRef.referendumIndex);

      if (!existingRef) {
        // New referendum
        updatedData.push(newRef);
      } else if (existingRef.status !== newRef.status) {
        // Status updated → replace the old one
        const idx = updatedData.findIndex(
          (r) => r.referendumIndex === newRef.referendumIndex
        );

        if (idx !== -1) {
          updatedData[idx] = newRef;
        }
      }
    }

    resultMap.set(current.network.value, {
      data: updatedData,
      network: current.network
    });
  }

  return Array.from(resultMap.values());
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
        uniqueKey = `${item.read}-${JSON.stringify(item.payout ?? '')}`;

        break;
      case 'receivedFund':
        timestamp = item.receivedFund?.timestamp;
        uniqueKey = `${item.read}-${JSON.stringify(item.receivedFund ?? '')}`;

        break;

      case 'referenda':
        timestamp = item.referenda?.latestTimestamp;
        uniqueKey = `${item.read}-${JSON.stringify(item.referenda ?? '')}`;

        break;
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

// /**
//  * Converts a numeric string with blockchain-style decimals (e.g. "92861564408", 10)
//  * into a human-readable decimal string (e.g. "9.2861564408").
//  */
// function divideAmountByDecimals (amountStr: string, decimals: number): string {
//   if (typeof amountStr !== 'string' || isNaN(Number(decimals)) || decimals < 0) {
//     return amountStr;
//   }
//   amountStr = amountStr.replace(/^0+/, '').padStart(decimals + 1, '0'); // remove leading zeros safely
//   const intPart = amountStr.slice(0, -decimals) || '0';
//   const fracPart = amountStr.slice(-decimals).replace(/0+$/, ''); // remove trailing zeros
//   return fracPart ? `${intPart}.${fracPart}` : intPart;
// }

/**
 * Converts a blockchain-style integer (string or number) into a scaled number.
 * Examples:
 *  - "92861564408", decimal=10 → 9.2861564408
 *  - 1234567 → 1234567
 *  - "123450000000000000000", decimal=18 → 123.45
 *
 * If the value is extremely large, it safely clamps at Number.MAX_SAFE_INTEGER.
 *
 * @param value - numeric string or number
 * @param decimalPoint - number of decimal digits to keep
 * @param decimal - blockchain-style decimals (divide by 10^decimal)
 * @returns numeric result (rounded)
 */
export function formatNumber (
  value: number | string | undefined,
  decimalPoint = 2,
  decimal = 0
): number {
  if (value === undefined || value === null) {
    return 0;
  }

  const strValue = value.toString().replace(/,/g, '').trim();

  if (!/^\d+(\.\d+)?$/.test(strValue)) {
    return 0;
  }

  let result: number;

  // If blockchain-style decimal division is required
  if (decimal > 0 && /^[0-9]+$/.test(strValue)) {
    // Use BigInt division for safety
    const bigintVal = BigInt(strValue);
    const divisor = 10n ** BigInt(decimal);

    // Get decimal as string manually
    const intPart = bigintVal / divisor;
    const fracPart = bigintVal % divisor;
    const fracStr = fracPart.toString().padStart(decimal, '0').slice(0, decimalPoint);

    result = parseFloat(`${intPart}.${fracStr}`);
  } else {
    result = parseFloat(strValue);
  }

  if (!isFinite(result)) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Round to requested decimal points
  const rounded = Number(result.toFixed(decimalPoint));

  return Math.min(rounded, Number.MAX_SAFE_INTEGER);
}

export function getNotificationItemTitle (type: NotificationType, referenda?: ReferendaProp) {
  const { t } = useTranslation();

  switch (type) {
    case 'receivedFund':
      return t('Fund Received');

    case 'referenda': {
      const status = referenda?.status ?? '';

      if (['approved', 'executed'].includes(status)) {
        return t('Referendum approved');
      } else if (['ongoing', 'decision', 'submitted'].includes(referenda?.status ?? '')) {
        return t('New Referendum');
      } else if (referenda?.status === 'cancelled') {
        return t('Referendum Cancelled');
      } else if (referenda?.status === 'timeout') {
        return t('Referendum time outed');
      } else {
        return t('Referendum Rejected');
      }
    }

    case 'stakingReward':
      return t('Reward');

    default:
      return t('Update');
  }
}

export function getNotificationDescription (item: NotificationMessageType, t: TFunction, chainInfo: ChainInfo, price: Price, currency: CurrencyItemType | undefined) {
  const { chainName, decimal, token } = chainInfo;
  const currencySign = currency?.sign;

  switch (item.type) {
    case 'receivedFund': {
      const assetSymbol = item.receivedFund?.assetSymbol;
      const assetAmount = formatNumber(item.receivedFund?.amount);
      const currencyAmount = formatNumber(item.receivedFund?.currencyAmount);

      const amountSection = `${assetAmount} ${assetSymbol} (${currencySign}${currencyAmount})`;

      return {
        text: t('Received {{amountSection}} on {{chainName}}', { replace: { amountSection, chainName } }),
        textInColor: amountSection
      };
    }

    case 'referenda': {
      const statusMap: Record<string, string> = {
        approved: t('{{chainName}} referendum #{{referendumIndex}} has been approved'),
        cancelled: t('{{chainName}} referendum #{{referendumIndex}} has been cancelled'),
        decision: t('{{chainName}} referendum #{{referendumIndex}} has been created'),
        executed: t('{{chainName}} referendum #{{referendumIndex}} has been executed'),
        ongoing: t('{{chainName}} referendum #{{referendumIndex}} has been created'),
        rejected: t('{{chainName}} referendum #{{referendumIndex}} has been rejected'),
        submitted: t('{{chainName}} referendum #{{referendumIndex}} has been submitted'),
        timeout: t('{{chainName}} referendum #{{referendumIndex}} has timed out')
      };

      const status = item.referenda?.status;
      const referendumIndex = item.referenda?.referendumIndex;
      // Default to "rejected" text if status is missing
      const textTemplate = statusMap[status ?? 'rejected'];

      return {
        text: t(textTemplate, {
          replace: { chainName, referendumIndex }
        }),
        textInColor: `#${referendumIndex}`
      };
    }

    case 'stakingReward': {
      const assetAmount = formatNumber(item.payout?.amount, 2, decimal);
      const currencyAmount = formatNumber(assetAmount * (price.price ?? 0));

      const amountSection = `${assetAmount} ${token} (${currencySign}${currencyAmount})`;

      return {
        text: t('Received {{amountSection}} from {{chainName}} staking', { replace: { amountSection, chainName } }),
        textInColor: amountSection
      };
    }
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
        timeout: neutralStyle
      };

      const status = item.referenda?.status;

      return statusMap[status ?? 'rejected'] ?? neutralStyle;
    }

    case 'stakingReward':
      return { ItemIcon: Award, bgcolor: '#277DFF4D', borderColor: '#2A4FA680', color: '#74A4FF' };
  }
}
