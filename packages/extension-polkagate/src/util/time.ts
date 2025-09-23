// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { BN, BN_THOUSAND, BN_TWO, bnMin } from '@polkadot/util';

import { BLOCK_RATE } from './constants';

/**
 * Calculates the estimated remaining time based on the given block count.
 *
 * @param {number} blocks - The number of blocks remaining.
 * @param {boolean} [noMinutes] - If `true`, omits the minutes when there are days.
 * @returns {string} The formatted remaining time (e.g., "2 days 3 hours 15 mins") or "finished" if time has elapsed.
 */
export function remainingTime (blocks: number, noMinutes?: boolean): string {
  let mins = Math.floor(blocks * BLOCK_RATE / 60);

  if (!mins) {
    return '';
  }

  if (mins <= 0) {
    return 'finished';
  }

  let hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  let time = '';

  mins -= hrs * 60;

  if (!(noMinutes && days) && mins) {
    time += mins + ' mins ';
  }

  hrs -= days * 24;

  if (hrs === 1) {
    time = hrs + ' hour ' + time;
  }

  if (hrs && hrs !== 1) {
    time = hrs + ' hours ' + time;
  }

  if (days === 1) {
    time = days + ' day ' + time;
  }

  if (days && days !== 1) {
    time = days + ' days ' + time;
  }

  return time;
}

/**
 * Converts a given time in seconds into a human-readable countdown format.
 *
 * @param {number | undefined} seconds - The number of seconds remaining.
 * @returns {string} The formatted countdown time (e.g., "2 days 3 hours 15 mins 30 sec") or "finished" if time has elapsed.
 */
export function remainingTimeCountDown (seconds: number | undefined): string {
  if (!seconds || seconds <= 0) {
    return 'finished';
  }

  const days = Math.floor(seconds / (60 * 60 * 24));
  const [hour, min, sec] = new Date(seconds * 1000).toISOString().substring(11, 19).split(':');

  const d = days ? `${days} day ` : '';
  const h = hour ? `${hour} hour ` : '';
  const m = min ? `${min} min ` : '';
  const s = sec ? `${sec} sec` : '';

  return d + h + m + s;
}

/**
 * Format options for the timestamp display
 */
export type TimestampPart = 'weekday' | 'month' | 'day' | 'year' | 'hours' | 'minutes' | 'seconds' | 'ampm';

/**
 * Formats a timestamp with customizable output based on the parts you want to include.
 *
 * @param {number|string|Date} timestamp - The timestamp to format. Can be:
 *   - number: milliseconds since epoch (e.g., 1723026480000)
 *   - string: a date string parsable by the Date constructor (e.g., "2024-08-06T19:48:00")
 *   - Date: a JavaScript Date object
 *
 * @param {TimestampPart[] | undefined} [parts] - Array of timestamp parts to include in the output:
 *   - If undefined or empty, returns the full formatted date
 *   - Available parts: 'weekday', 'month', 'day', 'year', 'hours', 'minutes', 'seconds', 'ampm'
 *
 * @param {string} [separator=", "] - The separator to use between parts
 *
 * @returns {string} The formatted date string including only the specified parts
 *
 * @example
 * // Returns something like "Tue, Aug 6, 2024, 7:48:00 PM"
 * formatTimestamp(1723026480000);
 *
 * @example
 * // Returns something like "Aug 6 7"
 * formatTimestamp(1723026480000, ['month', 'day', 'hours']);
 *
 * @example
 * // Returns something like "Aug-6-2024"
 * formatTimestamp(1723026480000, ['month', 'day', 'year'], '-');
 */
export function formatTimestamp (
  timestamp: number | string | Date,
  parts?: TimestampPart[]
): string {
  const date = new Date(timestamp);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const components: Record<TimestampPart, string | number> = {
    ampm: date.getHours() >= 12 ? 'PM' : 'AM',
    day: date.getDate(),
    hours: date.getHours() % 12 || 12,
    minutes: date.getMinutes().toString().padStart(2, '0'),
    month: months[date.getMonth()],
    seconds: date.getSeconds().toString().padStart(2, '0'),
    weekday: weekdays[date.getDay()],
    year: date.getFullYear()
  };

  if (!parts || parts.length === 0) {
    // Default full date-time
    return `${components.weekday}, ${components.month} ${components.day}, ${components.year}, ${components.hours}:${components.minutes}:${components.seconds} ${components.ampm}`;
  }

  const dateParts: string[] = [];
  const timeParts: string[] = [];

  parts.forEach((part) => {
    if (['weekday', 'month', 'day', 'year'].includes(part)) {
      if (part === 'month' && parts.includes('day')) {
        // Let 'month' and 'day' group together like "Apr 13"
        if (!dateParts.includes(`${components.month} ${components.day}`)) {
          dateParts.push(`${components.month} ${components.day}`);
        }
      } else if (part === 'day' && parts.includes('month')) {
        // Already handled above
      } else {
        dateParts.push(String(components[part]));
      }
    } else {
      // time parts
      timeParts.push(part);
    }
  });

  // Format time block smartly
  let timeString = '';

  if (timeParts.length > 0) {
    const hours = timeParts.includes('hours') ? components.hours : '';
    const minutes = timeParts.includes('minutes') ? `:${components.minutes}` : '';
    const seconds = timeParts.includes('seconds') ? `:${components.seconds}` : '';
    const ampm = timeParts.includes('ampm') ? ` ${components.ampm}` : '';

    timeString = `${hours}${minutes}${seconds}${ampm}`.trim();
  }

  if (dateParts.length > 0 && timeString) {
    return `${dateParts.join(' ')}, ${timeString}`;
  } else if (dateParts.length > 0) {
    return dateParts.join(' ');
  } else {
    return timeString;
  }
}

export function blockToDate (blockNumber?: number, currentBlock?: number, option?: Intl.DateTimeFormatOptions, iso?: boolean) {
  if (!blockNumber || !currentBlock) {
    return 'N/A';
  }

  let date;

  if (blockNumber >= currentBlock) {
    const time = (blockNumber - currentBlock) * 6000;
    const now = Date.now();

    date = new Date(now + time);
  } else {
    const diff = (currentBlock - blockNumber) * 6000;
    const now = Date.now();

    date = new Date(now - diff);
  }

  if (iso) {
    return date.toISOString();
  }

  return date.toLocaleDateString('en-US', option ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

// Some chains incorrectly use these, i.e. it is set to values such as 0 or even 2
// Use a low minimum validity threshold to check these against
const THRESHOLD = BN_THOUSAND.div(BN_TWO);
const DEFAULT_TIME = new BN(6_000);
const A_DAY = new BN(24 * 60 * 60 * 1000);

export function calcInterval (api: ApiPromise | undefined): BN {
  if (!api) {
    return DEFAULT_TIME;
  }

  return bnMin(A_DAY, (
    // Babe, e.g. Relay chains (Substrate defaults)
    api.consts['babe']?.['expectedBlockTime'] as unknown as BN ||
    // POW, eg. Kulupu
    api.consts['difficulty']?.['targetBlockTime'] as unknown as BN ||
    // Subspace
    // Subspace
    api.consts['subspace']?.['expectedBlockTime'] || (
      // Check against threshold to determine value validity
      (api.consts['timestamp']?.['minimumPeriod'] as unknown as BN).gte(THRESHOLD)
        // Default minimum period config
        ? (api.consts['timestamp']['minimumPeriod'] as unknown as BN).mul(BN_TWO)
        : api.query['parachainSystem']
          // default guess for a parachain
          ? DEFAULT_TIME.mul(BN_TWO)
          // default guess for others
          : DEFAULT_TIME
    )
  ));
}
