// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { type RefObject, useCallback } from 'react';

import { getTxTransfers } from '../../../util/api/getTransfers';
import { getTXsHistory } from '../../../util/api/getTXsHistory';
import { MAX_PAGE, SINGLE_PAGE_SIZE } from '../hookUtils/consts';
import { log } from '../hookUtils/utils';

interface UseTransactionFetchingProps {
    address: string | undefined;
    chain: Chain | null | undefined;
    // chainName: string | undefined;
    setTransfersTx: (payload: Partial<RecordTabStatus>) => void;
    setExtrinsicsTx: (payload: Partial<RecordTabStatusGov>) => void;
    requested: RefObject<string | undefined>;
}

interface UseTransactionFetchingResult {
    getTransfers: (currentState: RecordTabStatus) => Promise<void>;
    getExtrinsics: (currentState: RecordTabStatusGov) => Promise<void>;
}

/**
 * Handles fetching transaction data from APIs
 * Manages pagination and error states
 */
export function useTransactionFetching({ address, chain, requested, setExtrinsicsTx, setTransfersTx }: UseTransactionFetchingProps): UseTransactionFetchingResult {
    // Fetch transfer transactions
    const getTransfers = useCallback(async(currentState: RecordTabStatus): Promise<void> => {
        const { hasMore, isFetching, pageNum, transactions } = currentState;

        if (!chain?.genesisHash || !address) {
            log('Skipping received fetch - either chain or address does not exist');

            return;
        }

        if (isFetching || hasMore === false) {
            log('Skipping received fetch - already fetching or no more data');

            return;
        }

        log(`Fetching received page ${pageNum}`);
        setTransfersTx({ isFetching: true });

        try {
            const res = await getTxTransfers(address, chain.genesisHash, pageNum, SINGLE_PAGE_SIZE);

            // Validate response is for current request
            if (!requested.current || requested.current !== res?.for) {
                return setTransfersTx({
                    hasMore: false,
                    isFetching: false,
                    transactions: []
                });
            }

            const { count = 0, transfers = [] } = res.data || {};
            const nextPageNum = pageNum + 1;
            const hasMorePages = !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE;

            log(`Received transfers data: count=${count}, items=${transfers?.length ?? 0}, hasMore=${hasMorePages}`);

            setTransfersTx({
                hasMore: hasMorePages,
                isFetching: false,
                pageNum: nextPageNum,
                transactions: [...(transactions || []), ...(transfers || [])]
            });
        } catch (error) {
            console.error('Error fetching transfers:', error);
            setTransfersTx({
                hasMore: false,
                isFetching: false,
                transactions: []
            });
        }
    }, [address, chain?.genesisHash, requested, setTransfersTx]);

    // Fetch extrinsics transactions
    const getExtrinsics = useCallback(async(currentState: RecordTabStatusGov): Promise<void> => {
        const { hasMore, isFetching, pageNum, transactions } = currentState;

        if (!chain?.genesisHash || !address) {
            log('Skipping extrinsics fetch - either chain or address does not exist');

            return;
        }

        if (isFetching || hasMore === false) {
            log('Skipping extrinsics fetch - already fetching or no more data');

            return;
        }

        log(`Fetching extrinsics history page ${pageNum}`);
        setExtrinsicsTx({ isFetching: true });

        try {
            const res = await getTXsHistory(address, chain.genesisHash, pageNum, chain.ss58Format);

            // Validate response is for current request
            if (!requested.current || requested.current !== res?.for) {
                return setExtrinsicsTx({
                    hasMore: false,
                    isFetching: false,
                    transactions: []
                });
            }

            const { count = 0, extrinsics = [] } = res.data || {};
            const nextPageNum = pageNum + 1;
            const hasMorePages = !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE;

            log(`Received extrinsics data: count=${count}, items=${extrinsics?.length ?? 0}, hasMore=${hasMorePages}`);

            setExtrinsicsTx({
                hasMore: hasMorePages,
                isFetching: false,
                pageNum: nextPageNum,
                transactions: [...(transactions || []), ...(extrinsics || [])]
            });
        } catch (error) {
            console.error('Error fetching extrinsics history:', error);
            setExtrinsicsTx({
                hasMore: false,
                isFetching: false,
                transactions: []
            });
        }
    }, [address, chain?.genesisHash, chain?.ss58Format, requested, setExtrinsicsTx]);

    return {
        getExtrinsics,
        getTransfers
    };
}
