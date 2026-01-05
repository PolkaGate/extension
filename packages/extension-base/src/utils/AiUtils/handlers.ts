// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import type { AiTxAnyJson, EnrichedTx, TxHandler } from './aiTypes';

import { hexToString, isHex } from '@polkadot/util';

import { stakingActionCleaner } from './aiUtils';
import { formatAmount, isAye, toShortAddress } from './txUtil';

function handleBalanceTransfer (tx: AiTxAnyJson): EnrichedTx {
    const { dest, value } = tx['args'] as { dest: { id: string; }; value: number; };
    const decimal = tx['decimal'] as number;
    const token = tx['token'] as string;

    return {
        data: {
            amount: value ? formatAmount(value, decimal) : 0,
            to: dest.id ? toShortAddress(dest.id) : '',
            token
        },
        summaryHint: 'token transfer',
        type: 'KNOWN'
    };
}

function handleTransferAll (tx: AiTxAnyJson): EnrichedTx {
    const { dest } = tx['args'] as { dest: { id: string; }; };

    return {
        data: {
            action: 'transfer all',
            to: toShortAddress(dest.id),
            token: tx['token'] as string
        },
        type: 'KNOWN'
    };
}

function handleBatch (tx: AiTxAnyJson): EnrichedTx {
    const { calls } = tx['args'] as { calls: never[]; };

    return {
        data: {
            action: 'batch',
            callsCount: calls?.length ?? 0
        },
        type: 'KNOWN'
    };
}

function handleVoteDelegate (tx: AiTxAnyJson): EnrichedTx {
    const delegateArgs = tx['args'] as {
        to?: { id?: string };
        balance?: number;
        conviction?: string;
    };

    const action = stakingActionCleaner(tx['method'] as string);
    const amount = delegateArgs?.balance;
    const decimal = tx['decimal'] as number;
    const token = tx['token'] as string;

    return {
        data: {
            action,
            amount: amount ? formatAmount(amount, decimal) : '0',
            conviction: delegateArgs.conviction,
            to: toShortAddress(delegateArgs?.to?.id),
            token
        },
        type: 'KNOWN'
    };
}

function handleConvictionVote (tx: AiTxAnyJson): EnrichedTx {
    const voteArgs = tx['args'] as {
        poll_index: number;
        vote:
            | { standard: { vote: string; balance: number } }
            | { split: { aye: number; nay: number } }
            | { splitAbstain: { aye: number; nay: number; abstain: number } };
    };

    const decimal = tx['decimal'] as number;
    const token = tx['token'] as string;

    if ('standard' in voteArgs.vote) {
        const { balance, vote } = voteArgs.vote.standard;

        return {
            data: {
                referendumIndex: voteArgs.poll_index,
                token,
                voteType: isAye(vote) ? 'Aye' : 'Nay',
                votingPower: formatAmount(balance, decimal)
            },
            summaryHint: 'governance vote',
            type: 'KNOWN'
        };
    }

    if ('split' in voteArgs.vote) {
        const { aye, nay } = voteArgs.vote.split;

        return {
            data: {
                aye: formatAmount(aye, decimal),
                nay: formatAmount(nay, decimal),
                referendumIndex: voteArgs.poll_index,
                token,
                voteType: 'Split'
            },
            summaryHint: 'governance vote',
            type: 'KNOWN'
        };
    }

    if ('splitAbstain' in voteArgs.vote) {
        const { abstain, aye, nay } = voteArgs.vote.splitAbstain;

        return {
            data: {
                abstain: formatAmount(abstain, decimal),
                aye: formatAmount(aye, decimal),
                nay: formatAmount(nay, decimal),
                referendumIndex: voteArgs.poll_index,
                token,
                voteType: 'SplitAbstain'
            },
            summaryHint: 'governance vote',
            type: 'KNOWN'
        };
    }

    return {
        data: {
            referendumIndex: voteArgs.poll_index
        },
        summaryHint: 'governance vote',
        type: 'GENERIC'
    };
}

function handlePoolStaking (tx: AiTxAnyJson): EnrichedTx {
    const stakingArgs = tx['args'] as { amount?: number; pool_id?: number; extra?: { freeBalance?: number; rewards?: number | null } };
    const token = tx['token'] as string;
    const decimal = tx['decimal'] as number;
    const action = stakingActionCleaner(tx['method'] as string);
    const stakeAmount = stakingArgs?.amount ?? stakingArgs?.extra?.freeBalance ?? stakingArgs?.extra?.rewards ?? 0;

    return {
        data: {
            action,
            amount: stakeAmount > 0 ? formatAmount(stakeAmount, decimal) : '0',
            poolId: stakingArgs.pool_id,
            token
        },
        type: 'KNOWN'
    };
}

function handleSetMetadata (tx: AiTxAnyJson): EnrichedTx {
    const stakingArgs = tx['args'] as { metadata?: string; pool_id?: number; };
    const action = stakingActionCleaner(tx['method'] as string);
    const metadata = stakingArgs?.metadata ? isHex(stakingArgs?.metadata) ? hexToString(stakingArgs?.metadata) : stakingArgs?.metadata : '';

    return {
        data: {
            action,
            metadata,
            poolId: stakingArgs.pool_id
        },
        type: 'KNOWN'
    };
}

function handleUnbond (tx: AiTxAnyJson): EnrichedTx {
    const stakingArgs = tx['args'] as { member_account?: { id: string }; unbonding_points?: number; };
    const decimal = tx['decimal'] as number;
    const token = tx['token'] as string;

    const action = stakingActionCleaner(tx['method'] as string);
    const account = stakingArgs?.member_account?.id ? toShortAddress(stakingArgs?.member_account?.id) : '';
    const amount = stakingArgs?.unbonding_points ?? 0;

    return {
        data: {
            account,
            action,
            amount: amount ? formatAmount(amount, decimal) : '0',
            token
        },
        type: 'KNOWN'
    };
}

function handleStaking (tx: AiTxAnyJson): EnrichedTx {
    const stakingArgs = tx['args'] as { value?: number; max_additional?: number; };
    const decimal = tx['decimal'] as number;
    const token = tx['token'] as string;

    const action = stakingActionCleaner(tx['method'] as string);
    const amount = stakingArgs?.value ?? stakingArgs?.max_additional ?? 0;

    return {
        data: {
            action,
            amount: amount ? formatAmount(amount, decimal) : '0',
            token
        },
        type: 'KNOWN'
    };
}

function handleNominate (tx: AiTxAnyJson): EnrichedTx {
    const { targets } = tx['args'] as { targets: string[]; };

    return {
        data: {
            action: 'nominate',
            validators: targets?.map(toShortAddress) ?? []
        },
        type: 'KNOWN'
    };
}

function handleProxy (tx: AiTxAnyJson): EnrichedTx {
    const proxyArgs = tx['args'] as { call?: AiTxAnyJson; real: { id?: string; }; };

    return {
        data: {
            // calls: proxyArgs?.call,
            proxiedAccount: toShortAddress(proxyArgs?.real?.id)
        },
        type: 'KNOWN'
    };
}

export function explainTx (tx: AiTxAnyJson, key: string): EnrichedTx {
    return handlers[key]?.(tx) ?? {
        data: {
            args: tx['args'] as unknown,
            method: tx['method'] as string,
            section: tx['section'] as string
        },
        type: 'GENERIC'
    };
}

export const handlers: Record<string, TxHandler> = {
    'balances.transfer': handleBalanceTransfer,
    'balances.transferall': handleTransferAll,
    'balances.transferallowdeath': handleBalanceTransfer,
    'balances.transferkeepalive': handleBalanceTransfer,

    'convictionVoting.delegate': handleVoteDelegate,
    'convictionVoting.vote': handleConvictionVote,

    'nominationPools.bondextra': handlePoolStaking,
    'nominationPools.bondextraOther': handlePoolStaking,
    'nominationPools.claimpayout': handlePoolStaking,
    'nominationPools.create': handlePoolStaking,
    'nominationPools.createwithpoolid': handlePoolStaking,
    'nominationPools.join': handlePoolStaking,
    'nominationPools.setmetadata': handleSetMetadata,
    'nominationPools.unbond': handleUnbond,
    'nominationPools.withdrawunbonded': handleUnbond,

    'proxy.proxy': handleProxy,

    'staking.bond': handleStaking,
    'staking.bondextra': handleStaking,
    'staking.nominate': handleNominate,
    'staking.rebond': handleStaking,
    'staking.unbond': handleStaking,
    'staking.withdrawunbonded': handleStaking,

    'utility.batch': handleBatch,
    'utility.batchall': handleBatch,
    'utility.forcebatch': handleBatch
};
