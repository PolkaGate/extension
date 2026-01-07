// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { useEffect, useRef } from 'react';

import { log } from '../hookUtils/utils';

interface UseInfiniteScrollProps {
    address: string | undefined;
    chainName: string | undefined;
    receivedTx: RecordTabStatus;
    extrinsicsTx: RecordTabStatusGov;
    getTransfers: (state: RecordTabStatus) => Promise<void>;
    getExtrinsics: (state: RecordTabStatusGov) => Promise<void>;
    isReadyToFetch: boolean;
    withObserver: boolean;
}

/**
 * Manages infinite scroll behavior using IntersectionObserver
 * Initiates initial data fetches and handles scroll-triggered pagination
 */
export function useInfiniteScroll({ address, chainName, extrinsicsTx, getExtrinsics, getTransfers, isReadyToFetch, receivedTx, withObserver }: UseInfiniteScrollProps): void {
    const observerInstance = useRef<IntersectionObserver | null>(null);

    // Refs for latest state (to avoid stale closures in observer)
    const receivedStateRef = useRef<RecordTabStatus>(receivedTx);
    const extrinsicsStateRef = useRef<RecordTabStatusGov>(extrinsicsTx);

    // Track if initial fetch has been initiated
    const initialFetchInitiatedRef = useRef({
        extrinsics: false,
        received: false
    });

    // Keep state refs updated
    useEffect(() => {
        receivedStateRef.current = receivedTx;
    }, [receivedTx]);

    useEffect(() => {
        extrinsicsStateRef.current = extrinsicsTx;
    }, [extrinsicsTx]);

    // Setup IntersectionObserver for infinite scroll
    useEffect(() => {
        if (!isReadyToFetch || !withObserver) {
            return;
        }

        // Clean up previous observer
        if (observerInstance.current) {
            log('Disconnecting previous observer');
            observerInstance.current.disconnect();
        }

        // Create observer callback
        const observerCallback = (entries: IntersectionObserverEntry[]): void => {
            const [entry] = entries;

            if (!entry.isIntersecting) {
                log('Observer target not in view');

                return;
            }

            log('Observer target in view, checking for more data to fetch');

            const receivedState = receivedStateRef.current;
            const extrinsicsState = extrinsicsStateRef.current;

            let canFetch = false;

            // Check and fetch transfers
            if (shouldFetchMore(receivedState, 'received')) {
                log('More received available, fetching next page');
                canFetch = true;
                getTransfers(receivedState).catch(console.error);
            } else {
                log('No more received to fetch or already fetching', {
                    hasMore: receivedState.hasMore,
                    isFetching: receivedState.isFetching
                });
            }

            // Check and fetch extrinsics
            if (shouldFetchMore(extrinsicsState, 'extrinsics')) {
                log('More extrinsics available, fetching next page');
                canFetch = true;
                getExtrinsics(extrinsicsState).catch(console.error);
            } else {
                log('No more extrinsics to fetch or already fetching', {
                    hasMore: extrinsicsState.hasMore,
                    isFetching: extrinsicsState.isFetching
                });
            }

            // Disconnect if both sources exhausted
            if (!canFetch) {
                log('No more data to fetch for either type, disconnecting observer');
                observerInstance.current?.disconnect();
            }
        };

        // Create and configure observer
        log('Creating new IntersectionObserver');
        const options = {
            root: document.getElementById('scrollArea'),
            rootMargin: '0px',
            threshold: 0.5
        };

        observerInstance.current = new IntersectionObserver(observerCallback, options);

        // Start observing
        const target = document.getElementById('observerObj');

        if (target) {
            log('Started observing target element');
            observerInstance.current.observe(target);
        } else {
            log('Warning: Observer target element not found');
        }

        // Cleanup
        return () => {
            log('Cleaning up observer on unmount/rerun');
            observerInstance.current?.disconnect();
        };
    }, [getExtrinsics, getTransfers, isReadyToFetch, withObserver]);

    // Reset initial fetch flags when address/chain changes
    useEffect(() => {
        initialFetchInitiatedRef.current = {
            extrinsics: false,
            received: false
        };
    }, [address, chainName]);
}

/**
 * Determine if we should fetch more data
 */
function shouldFetchMore(
    state: RecordTabStatus | RecordTabStatusGov,
    type: 'received' | 'extrinsics'
): boolean {
    return Boolean(state.hasMore &&
        !state.isFetching &&
        !state.pageNum &&
        !initialFetchInitiatedRef.current[type]);
}

const initialFetchInitiatedRef = {
    current: {
        extrinsics: false,
        received: false
    }
};
