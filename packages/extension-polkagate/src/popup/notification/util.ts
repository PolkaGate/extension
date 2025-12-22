// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-template-curly-in-string */

import type { TFunction } from '@polkagate/apps-config/types';
import type { CurrencyItemType } from '@polkadot/extension-polkagate/src/fullscreen/home/partials/type';
import type { Prices, UserAddedEndpoint } from '@polkadot/extension-polkagate/src/util/types';
import type { NotificationMessage, NotificationMessageInformation, NotificationMessageType, NotificationType, ReceivedFundInformation, ReferendaInformation, ReferendaProp, ReferendaStatus, StakingRewardInformation } from './types';

import { createAssets } from '@polkagate/apps-config/assets';

import { getUserAddedPriceId } from '@polkadot/extension-polkagate/src/fullscreen/addNewChain/utils';
import { DEFAULT_PRICE, type Price } from '@polkadot/extension-polkagate/src/hooks/useTokenPriceBySymbol';
import { getPriceIdByChainName, sanitizeChainName, toCamelCase } from '@polkadot/extension-polkagate/src/util';
import chains from '@polkadot/extension-polkagate/src/util/chains';

import { NOTIFICATION_TIMESTAMP_OFFSET } from './constant';

export function timestampToDate (timestamp: number | string): string {
  // Ensure timestamp is a number and convert if it's a string
  const timestampNum = Number(timestamp);

  // Check if timestamp is valid
  if (isNaN(timestampNum)) {
    return 'Invalid Timestamp';
  }

  // Create a Date object (multiply by 1000 if it's a Unix timestamp in seconds)
  const date = new Date(timestampNum * 1000);

  return date.toLocaleString('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    second: '2-digit'
  });
}

const lastTime = (latestLoggedIn: number) => latestLoggedIn - NOTIFICATION_TIMESTAMP_OFFSET;

/**
 * Generate notification messages for referenda that occurred since the user's last login.
 */
export const generateReferendaNotifications = (
  latestLoggedIn: number,
  newRefs: ReferendaInformation[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];

  for (const currentNetworkData of newRefs) {
    let { data: currentReferenda, network } = currentNetworkData;

    currentReferenda = currentReferenda.filter(({ latestTimestamp }) => latestTimestamp >= lastTime(latestLoggedIn));

    for (const referenda of currentReferenda) {
      const itemKey = `referenda - ${network.value} - ${referenda.index} - ${referenda.latestTimestamp}`;

      newMessages.push({
        chain: network,
        itemKey,
        referenda,
        type: 'referenda'
      });
    }
  }

  return newMessages;
};

/**
 * Generate notification messages for received staking reward payouts that occurred since the user's last login.
 */
export const generateStakingRewardNotifications = (
  latestLoggedIn: number,
  payouts: StakingRewardInformation[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];

  payouts.forEach(({ address, data, network }) => {
    data
      .filter(({ timestamp }) => timestamp >= lastTime(latestLoggedIn))
      .forEach((payout) => {
        const itemKey = `payout - ${network.value} - ${payout.index} - ${payout.timestamp}`;

        newMessages.push({
          chain: network,
          forAccount: address,
          itemKey,
          payout,
          type: 'stakingReward'
        });
      });
  });

  return newMessages;
};

/**
 * Generate notification messages for received funds that occurred since the user's last login.
 */
export const generateReceivedFundNotifications = (
  latestLoggedIn: number,
  transfers: ReceivedFundInformation[]
): NotificationMessageType[] => {
  const newMessages: NotificationMessageType[] = [];

  transfers.forEach(({ address, data, network }) => {
    data
      .filter(({ timestamp }) => timestamp >= lastTime(latestLoggedIn))
      .forEach((receivedFund) => {
        const itemKey = `transfer - ${network.value} - ${receivedFund.index} - ${receivedFund.timestamp}`;

        newMessages.push({
          chain: network,
          forAccount: address,
          itemKey,
          receivedFund,
          type: 'receivedFund'
        });
      });
  });

  return newMessages;
};

/**
 * Marks messages as read
 */
export const markMessagesAsRead = (messages: NotificationMessageInformation[]) => {
  return messages.map((message) => (
    {
      ...message,
      read: true
    }
  ));
};

// Utility to get date string like "15 Dec 2025"
function getDayKey (timestamp: number): string {
  const date = new Date(timestamp * 1000); // convert seconds → ms

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Groups notifications by day and sorts both the groups and their items by timestamp.
 */
export function groupNotificationsByDay (
  notifications: NotificationMessageInformation[] | undefined
): Record<string, NotificationMessageInformation[]> | undefined {
  if (!notifications) {
    return;
  }

  const grouped = notifications.reduce<Record<string, NotificationMessageInformation[]>>((acc, item) => {
    const timestamp = item.message.payout?.timestamp || item.message.receivedFund?.timestamp || item.message.referenda?.latestTimestamp;

    if (!timestamp) {
      return acc;
    }

    const dayKey = getDayKey(timestamp);

    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }

    acc[dayKey].push(item);

    return acc;
  }, {});

  // Sort items within each day by timestamp (newest first)
  for (const dayKey in grouped) {
    grouped[dayKey].sort((a, b) => {
      const timeA = a.message.payout?.timestamp || a.message.receivedFund?.timestamp || a.message.referenda?.latestTimestamp || 0;
      const timeB = b.message.payout?.timestamp || b.message.receivedFund?.timestamp || b.message.referenda?.latestTimestamp || 0;

      return timeB - timeA;
    });
  }

  // Sort the day groups themselves (newest first)
  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);

    return dateB.getTime() - dateA.getTime(); // newest first
  });

  // Convert sorted entries back into a Record
  const sortedGrouped: Record<string, NotificationMessageInformation[]> = Object.fromEntries(sortedEntries);

  return sortedGrouped;
}

/**
 * Check if a given date string (formatted as "17 Dec 2024") represents today's date.
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
 */
export function getTimeOfDay (timestamp: number): string {
  // Convert timestamp from seconds → milliseconds
  const date = new Date(timestamp * 1000);

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    hour12: true,
    minute: '2-digit'
  }).toLowerCase();
}

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

export function getNotificationItemTitle (t: TFunction, type: NotificationType, referenda?: ReferendaProp) {
  switch (type) {
    case 'receivedFund':
      return t('Fund Received');

    case 'referenda': {
      const status = referenda?.status ?? '';

      if (['approved', 'executed', 'confirm'].includes(status)) {
        return t('Referendum executed');
      }

      if (['ongoing', 'decision', 'submitted'].includes(status)) {
        return t('New Referendum');
      }

      if (status === 'cancelled') {
        return t('Referendum Cancelled');
      }

      if (status === 'timeout') {
        return t('Referendum timed out');
      }

      if (status === 'executedfailed') {
        return t('Referendum executed but failed');
      }

      return t('Referendum Rejected');
    }

    case 'stakingReward':
      return t('Reward');

    default:
      return t('Update');
  }
}

export function getNotificationDescription (item: NotificationMessageType, t: TFunction, chainInfo: ChainInfoShort, price: Price, currency: CurrencyItemType | undefined) {
  const { chainName, decimal, token } = chainInfo;
  const currencySign = currency?.sign;

  switch (item.type) {
    case 'receivedFund': {
      const { amount, assetSymbol, currencyAmount } = item.receivedFund || {};
      const assetAmount = formatNumber(amount);
      const _currencyAmount = formatNumber(currencyAmount);

      const amountSection = `${assetAmount} ${assetSymbol} (${currencySign}${_currencyAmount})`;

      return {
        text: t('Received {{amountSection}} on {{chainName}}', { replace: { amountSection, chainName } }),
        textInColor: amountSection
      };
    }

    case 'referenda': {
      const { referendumIndex, status = 'rejected' } = item.referenda || {};

      const statusMap: Record<string, string> = {
        approved: t('{{chainName}} referendum #{{referendumIndex}} has been approved', { replace: { chainName, referendumIndex } }),
        cancelled: t('{{chainName}} referendum #{{referendumIndex}} has been cancelled', { replace: { chainName, referendumIndex } }),
        confirm: t('{{chainName}} referendum #{{referendumIndex}} has been confirmed', { replace: { chainName, referendumIndex } }),
        decision: t('{{chainName}} referendum #{{referendumIndex}} has been created', { replace: { chainName, referendumIndex } }),
        executed: t('{{chainName}} referendum #{{referendumIndex}} has been executed', { replace: { chainName, referendumIndex } }),
        executedfailed: t('{{chainName}} referendum #{{referendumIndex}} execution failed', { replace: { chainName, referendumIndex } }),
        ongoing: t('{{chainName}} referendum #{{referendumIndex}} has been created', { replace: { chainName, referendumIndex } }),
        rejected: t('{{chainName}} referendum #{{referendumIndex}} has been rejected', { replace: { chainName, referendumIndex } }),
        submitted: t('{{chainName}} referendum #{{referendumIndex}} has been submitted', { replace: { chainName, referendumIndex } }),
        timedOut: t('{{chainName}} referendum #{{referendumIndex}} has timed out', { replace: { chainName, referendumIndex } }),
        timeout: t('{{chainName}} referendum #{{referendumIndex}} has timed out', { replace: { chainName, referendumIndex } })
      };

      return {
        text: statusMap[status],
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

export function getNotificationIcon (type: NotificationType, referendaStatus: ReferendaStatus | undefined) {
  switch (type) {
    case 'receivedFund':
      return { bgcolor: '#06D7F64D', borderColor: '#06D7F680', color: '#06D7F6', itemIcon: 'ArrowDown3' };

    case 'referenda': {
      const neutralStyle = { bgcolor: '#303045', borderColor: '#222236', color: '#696D7E', itemIcon: 'Receipt2' };
      const executedStyle = { bgcolor: '#FF4FB91A', borderColor: '#FF4FB940', color: '#FF4FB9', itemIcon: 'Receipt2' };
      const decisionStyle = { bgcolor: '#82FFA540', borderColor: '#82FFA51A', color: '#82FFA5', itemIcon: 'Receipt2' };

      const statusMap: Record<ReferendaStatus, { bgcolor: string; borderColor: string; color: string; itemIcon: string; }> = {
        approved: executedStyle,
        cancelled: neutralStyle,
        confirm: executedStyle,
        decision: decisionStyle,
        executed: executedStyle,
        executedfailed: neutralStyle,
        ongoing: decisionStyle,
        rejected: neutralStyle,
        submitted: decisionStyle,
        timeout: neutralStyle
      };

      return statusMap[referendaStatus ?? 'rejected'] ?? neutralStyle;
    }

    case 'stakingReward':
      return { bgcolor: '#277DFF4D', borderColor: '#2A4FA680', color: '#74A4FF', itemIcon: 'Award' };
  }
}

const assetsChains = createAssets();

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @param assetId : asset id on multi asset chains
 * @param assetChainName : chain name to fetch asset id price from
 * @returns price : price of the token which the address is already switched to
 */
export function getTokenPriceBySymbol (tokenSymbol: string | undefined, chainName: string | undefined, genesisHash: string | undefined, pricesInCurrencies: Prices | null | undefined, endpoints: Record<`0x${string}`, UserAddedEndpoint> | undefined): Price {
  const userAddedPriceId = getUserAddedPriceId(genesisHash, endpoints);
  const maybeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];

  if (!chainName || !pricesInCurrencies || !tokenSymbol || !genesisHash) {
    return DEFAULT_PRICE;
  }

  // FixMe, on second fetch of asset id its type will get string which is weird!!
  const maybeAssetInfo = maybeAssetsOnMultiAssetChains?.find(({ symbol }) => symbol.toLowerCase() === tokenSymbol.toLowerCase()) ?? undefined;

  const priceId = maybeAssetInfo?.priceId || userAddedPriceId || getPriceIdByChainName(chainName);

  const maybePriceValue = priceId ? pricesInCurrencies.prices?.[priceId]?.value || 0 : 0;

  return {
    price: maybePriceValue,
    priceDate: pricesInCurrencies.date
  };
}

interface ChainInfoShort {
  chainName: string | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export const getChainInfo = (genesisHash: string | undefined): ChainInfoShort => {
  const chainInfo = chains.find(({ genesisHash: chainGenesisHash }) => chainGenesisHash === genesisHash);
  const chainName = sanitizeChainName(chainInfo?.chain, true);
  const decimal = chainInfo?.tokenDecimal;
  const token = chainInfo?.tokenSymbol;

  return {
    chainName,
    decimal,
    token
  };
};

export const getNotificationMessages = (item: NotificationMessageType, chainInfo: ChainInfoShort, currency: CurrencyItemType | undefined, price: Price, t: TFunction): NotificationMessage => {
  const fallbackTimestamp = Math.floor(Date.now() / 1000);
  const timestamp = item.payout?.timestamp ?? item.receivedFund?.timestamp ?? item.referenda?.latestTimestamp ?? fallbackTimestamp;
  const index = item.payout?.index ?? item.receivedFund?.index ?? item.referenda?.index ?? 0;

  const title = getNotificationItemTitle(t, item.type, item.referenda);
  const time = getTimeOfDay(timestamp);
  const description = getNotificationDescription(item, t, chainInfo, price, currency);
  const iconInfo = getNotificationIcon(item.type, item.referenda?.status);

  const itemKey = `${item.type} - ${item.chain?.value} - ${index} - ${timestamp}`;

  return {
    detail: {
      description,
      iconInfo,
      itemKey,
      time,
      timestamp,
      title
    },
    info: {
      chain: item.chain,
      forAccount: item.forAccount,
      type: item.type
    }
  };
};

export const filterMessages = (pervMessages: NotificationMessageInformation[] | undefined, newMessages: NotificationMessageType[] | undefined) => {
  if (!newMessages?.length) {
    return pervMessages;
  }

  if (!pervMessages?.length) {
    return newMessages.map((item) => ({ message: item, read: false })) ?? [];
  }

  const pervMessagesSet = new Set(pervMessages.map(({ message }) => message.itemKey));

  const filteredMessages = newMessages
    .filter(({ itemKey }) => !pervMessagesSet.has(itemKey))
    .map((item) => ({ message: item, read: false }));

  return pervMessages.concat(filteredMessages);
};
