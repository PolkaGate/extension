// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatTimestamp } from '@polkadot/extension-polkagate/src/util';

import { MIN_HISTORY_RANGE_ITEMS } from '../constants';

export default function useHistoryRange(allHistories: TransactionDetail[] | null | undefined) {
  const [historyRange, setHistoryRange] = useState<[number, number]>();
  const [isHistoryRangeTouched, setIsHistoryRangeTouched] = useState(false);
  const fetchedHistories = useMemo(() => allHistories ?? [], [allHistories]);

  const historyDateMarks = useMemo(() => Array.from(new Set(
    fetchedHistories
      .map(({ date }) => date)
      .filter((date): date is number => Number.isFinite(date))
  ))
    .sort((a, b) => a - b)
    .map((value) => ({ value }))
  , [fetchedHistories]);
  const historyRangeMin = historyDateMarks[0]?.value;
  const historyRangeMax = historyDateMarks[historyDateMarks.length - 1]?.value;
  const canUseHistoryRange = historyDateMarks.length >= MIN_HISTORY_RANGE_ITEMS && historyRangeMin !== undefined && historyRangeMax !== undefined && historyRangeMin < historyRangeMax;

  useEffect(() => {
    if (!canUseHistoryRange || historyRangeMin === undefined || historyRangeMax === undefined) {
      setHistoryRange(undefined);
      setIsHistoryRangeTouched(false);

      return;
    }

    setHistoryRange((prev) => {
      const next: [number, number] = !prev || !isHistoryRangeTouched
        ? [historyRangeMin, historyRangeMax]
        : [
          Math.max(historyRangeMin, Math.min(prev[0], historyRangeMax)),
          Math.min(historyRangeMax, Math.max(prev[1], historyRangeMin))
        ];

      if (next[0] > next[1]) {
        return [historyRangeMin, historyRangeMax];
      }

      return prev?.[0] === next[0] && prev?.[1] === next[1] ? prev : next;
    });
  }, [canUseHistoryRange, historyRangeMax, historyRangeMin, isHistoryRangeTouched]);

  const rangeFilteredHistories = useMemo(() => {
    if (!canUseHistoryRange || !historyRange) {
      return fetchedHistories;
    }

    const [start, end] = historyRange;

    return fetchedHistories.filter(({ date }) => date >= start && date <= end);
  }, [canUseHistoryRange, fetchedHistories, historyRange]);

  const historyRangeLabel = useMemo(() => {
    if (!historyRange) {
      return '';
    }

    const [start, end] = historyRange;
    const startDate = formatTimestamp(start, ['month', 'day', 'year']);
    const endDate = formatTimestamp(end, ['month', 'day', 'year']);

    return startDate === endDate
      ? `${startDate}, ${formatTimestamp(start, ['hours', 'minutes', 'ampm'])} - ${formatTimestamp(end, ['hours', 'minutes', 'ampm'])}`
      : `${startDate} - ${endDate}`;
  }, [historyRange]);

  const resetHistoryRange = useCallback(() => {
    setHistoryRange(undefined);
    setIsHistoryRangeTouched(false);
  }, []);

  const updateHistoryRange = useCallback((value: number[]) => {
    if (value.length < 2) {
      return;
    }

    const next: [number, number] = [value[0], value[1]];

    setIsHistoryRangeTouched(true);
    setHistoryRange((prev) => prev?.[0] === next[0] && prev?.[1] === next[1] ? prev : next);
  }, []);

  return {
    canUseHistoryRange,
    fetchedHistories,
    historyDateMarks,
    historyRange,
    historyRangeLabel,
    historyRangeMax,
    historyRangeMin,
    rangeFilteredHistories,
    resetHistoryRange,
    updateHistoryRange
  };
}
