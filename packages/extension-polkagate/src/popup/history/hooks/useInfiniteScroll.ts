// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { useEffect, useRef } from 'react';

import { log } from '../hookUtils/utils';

interface UseInfiniteScrollProps {
    enabled?: boolean;
    extrinsicsTx: RecordTabStatusGov;
    getExtrinsics: (state: RecordTabStatusGov) => Promise<void>;
    getTransfers: (state: RecordTabStatus) => Promise<void>;
    isReadyToFetch: boolean;
    receivedTx: RecordTabStatus;
}

/**
 * Manages infinite scroll behavior using IntersectionObserver
 * Initiates initial data fetches and handles scroll-triggered pagination
 */
export function useInfiniteScroll({ enabled = true, extrinsicsTx, getExtrinsics, getTransfers, isReadyToFetch, receivedTx }: UseInfiniteScrollProps): void {
    const observerInstance = useRef<IntersectionObserver | null>(null);

    // Refs for latest state (to avoid stale closures in observer)
    const receivedStateRef = useRef<RecordTabStatus>(receivedTx);
    const extrinsicsStateRef = useRef<RecordTabStatusGov>(extrinsicsTx);

    // Keep state refs updated
    useEffect(() => {
        receivedStateRef.current = receivedTx;
    }, [receivedTx]);

    useEffect(() => {
        extrinsicsStateRef.current = extrinsicsTx;
    }, [extrinsicsTx]);

    useEffect(() => {
        if (!enabled || !isReadyToFetch) {
            return;
        }

        const shouldFetchInitialReceived = receivedTx.pageNum === 0 && !receivedTx.isFetching && !receivedTx.transactions?.length;
        const shouldFetchInitialExtrinsics = extrinsicsTx.pageNum === 0 && !extrinsicsTx.isFetching && !extrinsicsTx.transactions?.length;

        if (shouldFetchInitialReceived) {
            log('Fetching initial received page');
            getTransfers(receivedTx).catch(console.error);
        }

        if (shouldFetchInitialExtrinsics) {
            log('Fetching initial extrinsics page');
            getExtrinsics(extrinsicsTx).catch(console.error);
        }

        if (shouldFetchInitialReceived || shouldFetchInitialExtrinsics) {
            return;
        }
    }, [enabled, extrinsicsTx, getExtrinsics, getTransfers, isReadyToFetch, receivedTx]);

    // Setup IntersectionObserver for pagination after the first batch is loaded
    useEffect(() => {
        if (!enabled || !isReadyToFetch) {
            return;
        }

        const hasLoadedFirstBatch = receivedTx.pageNum > 0 || extrinsicsTx.pageNum > 0;

        if (!hasLoadedFirstBatch) {
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

            let didStartFetch = false;

            // Check and fetch transfers
            if (shouldFetchMore(receivedState)) {
                log('More received available, fetching next page');
                didStartFetch = true;
                getTransfers(receivedState).catch(console.error);
            } else {
                log('No more received to fetch or already fetching', {
                    hasMore: receivedState.hasMore,
                    isFetching: receivedState.isFetching
                });
            }

            // Check and fetch extrinsics
            if (shouldFetchMore(extrinsicsState)) {
                log('More extrinsics available, fetching next page');
                didStartFetch = true;
                getExtrinsics(extrinsicsState).catch(console.error);
            } else {
                log('No more extrinsics to fetch or already fetching', {
                    hasMore: extrinsicsState.hasMore,
                    isFetching: extrinsicsState.isFetching
                });
            }

            // Keep observing while requests are in flight. Only disconnect when both
            // sources are actually exhausted, not merely busy with the current page.
            if (didStartFetch) {
                return;
            }

            const bothExhausted = receivedState.hasMore === false && extrinsicsState.hasMore === false;

            if (bothExhausted) {
                log('No more data to fetch for either type, disconnecting observer');
                observerInstance.current?.disconnect();
            }
        };

        // Start observing
        const target = document.getElementById('observerObj');

        if (target) {
            const root = findScrollRoot(target);

            log('Creating new IntersectionObserver', { hasRoot: !!root });
            observerInstance.current = new IntersectionObserver(observerCallback, {
                // Observe relative to the actual scroll container that owns the sentinel.
                root,
                rootMargin: '120px 0px',
                threshold: 0
            });

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
    }, [enabled, extrinsicsTx.pageNum, getExtrinsics, getTransfers, isReadyToFetch, receivedTx.pageNum]);
}

/**
 * Determine if should fetch more data
 */
function shouldFetchMore(state: RecordTabStatus | RecordTabStatusGov): boolean {
    return Boolean(state.hasMore && !state.isFetching);
}

function findScrollRoot(target: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = target.parentElement;

    while (current) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        const isScrollable = ['auto', 'scroll', 'overlay'].includes(overflowY) && current.scrollHeight > current.clientHeight;

        if (isScrollable) {
            return current;
        }

        current = current.parentElement;
    }

    return null;
}
