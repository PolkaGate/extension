// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationMessageType } from '../types';

import { useCallback, useMemo } from 'react';

function useNotificationLink (message: NotificationMessageType) {
    const isNavigable = useMemo(() => {
        const networkName = message.chain?.text;

        if (!networkName) {
            return false;
        }

        switch (message.type) {
            case 'referenda':
                return message.referenda?.index !== undefined;

            case 'stakingReward':
                return true;

            case 'receivedFund':
                return message.receivedFund?.index !== undefined;

            default:
                return false;
        }
    }, [message]);

    const onClick = useCallback(() => {
        if (!isNavigable) {
            return;
        }

        const networkName = message.chain?.text;
        const { forAccount, payout, receivedFund, type } = message;

        switch (type) {
            case 'referenda': {
                const referendumIndex = message.referenda?.index;
                const subsquareChainName = networkName?.toLowerCase().includes('polkadot')
                    ? 'polkadot'
                    : 'kusama';

                window.open(`https://${subsquareChainName}.subsquare.io/referenda/${referendumIndex}`, '_blank');
                break;
            }

            case 'stakingReward': {
                if (payout?.eventId) {
                    window.open(`https://${networkName}.subscan.io/event/${payout.eventId}`, '_blank');
                } else {
                    window.open(`https://${networkName}.subscan.io/account/${forAccount}?tab=reward`, '_blank');
                }

                break;
            }

            case 'receivedFund': {
                window.open(`https://${networkName}.subscan.io/extrinsic/${receivedFund?.index}`, '_blank');
                break;
            }
        }
    }, [isNavigable, message]);

    return {
        isNavigable,
        onClick
    };
}

export default useNotificationLink;
