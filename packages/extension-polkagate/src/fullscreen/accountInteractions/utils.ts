// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InteractionLink, InteractionNode } from './buildInteractionGraph';

import { historyIconBgColor } from '@polkadot/extension-polkagate/src/util';

export const formatOption = (option: string) => option
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export const linkColor = (direction: InteractionLink['direction'], isDark: boolean) => {
  switch (direction) {
    case 'sent':
      return '#FF4FB9';
    case 'received':
      return '#2ED3B7';
    default:
      return isDark ? '#AA83DC' : '#674394';
  }
};

export const nodeColor = (node: InteractionNode, isDark: boolean) =>
  node.isCenter
    ? '#FF4FB9'
    : node.sentCount > 0 && node.receivedCount > 0
      ? isDark ? '#AA83DC' : '#674394'
      : node.sentCount > 0
        ? '#FF4FB9'
        : '#2ED3B7';

export const nodeRadius = (node: InteractionNode) => node.isCenter ? 11 : Math.min(11, 5 + Math.sqrt(node.txCount || 1) * 1.8);

export const validatorDisplayName = (node: InteractionNode, fallback: string) => node.validatorName || fallback;

export const recentIconBackground = (action: string, isDark: boolean) => {
  if (isDark) {
    return historyIconBgColor(action);
  }

  const normalizedAction = action.toLowerCase();

  return ['receive', 'reward'].includes(normalizedAction)
    ? '#E9FFF1'
    : ['send', 'proxy', 'utility'].includes(normalizedAction)
      ? '#FFFFFF'
      : '#F5F4FF';
};

export const linkColor3D = (direction: InteractionLink['direction'], isDark: boolean) => {
  if (!isDark) {
    return linkColor(direction, isDark);
  }

  switch (direction) {
    case 'sent':
      return '#FF5AC3';
    case 'received':
      return '#35E6CE';
    default:
      return '#B88CFF';
  }
};
