// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from './types';

import { isAye } from '../fullscreen/governance/util';

export const ACTION_TYPES = ['send', 'receive', 'solo staking', 'pool staking', 'reward', 'aye', 'nay', 'abstain', 'delegate', 'utility', 'balances', 'governance', 'proxy'] as const;

export type ActionType = typeof ACTION_TYPES[number];

export const isActionType = (value: unknown): value is ActionType => {
  return typeof value === 'string' && (ACTION_TYPES as readonly string[]).includes(value);
};

export const isReward = (historyItem: TransactionDetail) => ['withdraw rewards', 'claim payout'].includes(historyItem.subAction?.toLowerCase() ?? '');

export const getVoteType = (voteType: number | null | undefined) => {
  if (voteType === undefined) {
    return undefined;
  } else if (voteType === null) {
    return 'abstain';
  } else if (isAye(voteType as unknown as string)) {
    return 'aye';
  } else if (!isAye(voteType as unknown as string)) {
    return 'nay';
  }

  return undefined;
};

export function resolveActionType(historyItem: TransactionDetail): string {
  let action: string =
    isReward(historyItem)
      ? 'reward'
      : getVoteType(historyItem.voteType) ?? historyItem.subAction ?? '';

  if (!isActionType(action)) {
    action = historyItem.action;
  }

  return action;
}

export const historyIconBgColor = (action: string) => {
  const normalizedAction = action.toLowerCase() as ActionType;

  const actionColors: Record<ActionType, string> = {
    abstain: '#6743944D', // can be removed in favor of default color
    aye: '#6743944D',
    balances: '#6743944D',
    delegate: '#6743944D',
    governance: '#6743944D',
    nay: '#6743944D',
    'pool staking': '#6743944D',
    proxy: 'transparent',
    receive: '#82FFA540',
    reward: '#82FFA540',
    send: 'transparent',
    'solo staking': '#6743944D',
    utility: 'transparent'
  } as const;

  return actionColors[normalizedAction] || '#6743944D';
};

export function saveAsHistory(formatted: string, info: TransactionDetail) {
  chrome.storage.local.get('history', (res) => {
    const k = `${formatted}`;
    const last = (res?.['history'] ?? {}) as unknown as Record<string, TransactionDetail[]>;

    if (last[k]) {
      last[k].push(info);
    } else {
      last[k] = [info];
    }

    // eslint-disable-next-line no-void
    void chrome.storage.local.set({ history: last });
  });
}

export async function getHistoryFromStorage(formatted: string): Promise<TransactionDetail[] | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get('history', (res) => {
      const k = `${formatted}`;
      const last = (res?.['history'] ?? {}) as unknown as Record<string, TransactionDetail[]>;

      resolve(last?.[k]);
    });
  });
}
