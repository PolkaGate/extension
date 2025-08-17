// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
