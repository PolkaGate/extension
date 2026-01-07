// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';
import type { FilterOptions, RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { useMemo } from 'react';

import { log } from '../hookUtils/utils';

interface UseTransactionGroupingProps {
    allHistories: TransactionDetail[] | null | undefined;
    receivedTx: RecordTabStatus;
    extrinsicsTx: RecordTabStatusGov;
    filterOptions?: FilterOptions;
}

/**
 * Groups transactions by date and applies filters
 * Returns null if no items and nothing more to fetch
 * Returns undefined if still loading
 */
export function useTransactionGrouping({ allHistories, extrinsicsTx, filterOptions, receivedTx }: UseTransactionGroupingProps): Record<string, TransactionDetail[]> | null | undefined {
    return useMemo(() => {
        // Check if we have no items
        if (allHistories === null) {
            return null;
        } else if (!allHistories?.length) {
            // If no more data to fetch from either source, return null
            if (!receivedTx.hasMore && !extrinsicsTx.hasMore) {
                return null;
            }

            // Still loading or more to fetch
            return undefined;
        }

        // Apply filters if any are active
        const filteredHistories = applyFilters(allHistories, filterOptions);

        // Group by date
        return groupByDate(filteredHistories);
    }, [allHistories, filterOptions, receivedTx.hasMore, extrinsicsTx.hasMore]);
}

/**
 * Apply transaction type filters if specified
 */
function applyFilters(histories: TransactionDetail[], filterOptions?: FilterOptions): TransactionDetail[] {
    // Check if any filters are active
    const shouldFilter = filterOptions && !Object.values(filterOptions).every((filter) => filter);

    if (!shouldFilter || !filterOptions) {
        return histories;
    }

    const originalCount = histories.length;

    const filtered = histories.filter(({ action }) => {
        const actionLower = action.toLowerCase();

        return (
            (filterOptions.transfers && actionLower === 'balances') ||
            (filterOptions.governance && action === 'governance') ||
            (filterOptions.staking && ['solo staking', 'pool staking'].includes(action))
        );
    });

    log(`Filtered transactions: ${originalCount} -> ${filtered.length}`);

    return filtered;
}

/**
 * Group transactions by formatted date string
 */
function groupByDate(transactions: TransactionDetail[]): Record<string, TransactionDetail[]> {
    const grouped: Record<string, TransactionDetail[]> = {};
    const dateOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    };

    for (const transaction of transactions) {
        const day = new Date(transaction.date).toLocaleDateString(undefined, dateOptions);

        if (!grouped[day]) {
            grouped[day] = [];
        }

        grouped[day].push(transaction);
    }

    return grouped;
}
