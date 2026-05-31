// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../util/types';

import { sciToDecimal } from '@polkadot/extension-polkagate/src/util';
import { BN, BN_TEN, hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';

const toShortAddress = (address: string, count = 6): string => `${address.slice(0, count)}...${address.slice(-1 * count)}`;

const isValidInteractionAddress = (address: string | undefined): boolean => {
  try {
    if (!address || address === 'undefined') {
      return false;
    }

    if (isEthereumAddress(address)) {
      return true;
    }

    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch {
    return false;
  }
};

export type InteractionDirection = 'sent' | 'received' | 'mixed';
export type DirectionFilter = InteractionDirection | 'all';
export type StatusFilter = 'all' | 'completed' | 'failed';

export interface InteractionFilters {
  direction: DirectionFilter;
  status: StatusFilter;
  type: string;
}

export interface InteractionNode {
  id: string;
  address: string;
  label: string;
  name?: string;
  txCount: number;
  sentCount: number;
  receivedCount: number;
  failedCount: number;
  isValidator?: boolean;
  isCenter?: boolean;
  latestDate?: number;
  validatorName?: string;
}

export interface TokenTotal {
  amount: string;
  genesisHash?: string;
  token: string;
}

export interface InteractionLink {
  id: string;
  source: string;
  target: string;
  counterparty: string;
  direction: InteractionDirection;
  txCount: number;
  sentCount: number;
  receivedCount: number;
  failedCount: number;
  latestDate?: number;
  tokens: TokenTotal[];
  actionTypes: string[];
  transactions: TransactionDetail[];
}

export interface InteractionGraph {
  nodes: InteractionNode[];
  links: InteractionLink[];
}

const ALL_TYPES = 'all';
const DECIMAL_AMOUNT_REGEX = /^(?:\d+\.?\d*|\.\d+)$/;

interface DecimalAmount {
  scale: number;
  value: BN;
}

const emptyGraph = (selectedAddress: string): InteractionGraph => ({
  links: [],
  nodes: [{
    address: selectedAddress,
    failedCount: 0,
    id: normalizeAddress(selectedAddress) ?? selectedAddress,
    isCenter: true,
    label: toShortAddress(selectedAddress),
    receivedCount: 0,
    sentCount: 0,
    txCount: 0
  }]
});

export const normalizeAddress = (address: string | null | undefined): string | undefined => {
  if (!address || !isValidInteractionAddress(address)) {
    return undefined;
  }

  return isEthereumAddress(address)
    ? address.toLowerCase()
    : encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address, true), 42);
};

const normalizeAmount = (amount: string | undefined): string => {
  const rawAmount = amount?.replace(/,/g, '').trim();

  if (!rawAmount) {
    return '0';
  }

  const decimalAmount = sciToDecimal(rawAmount);

  if (!DECIMAL_AMOUNT_REGEX.test(decimalAmount)) {
    return '0';
  }

  const [whole = '0', fraction = ''] = decimalAmount.split('.');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || '0';
  const normalizedFraction = fraction.replace(/0+$/, '');
  const normalizedAmount = normalizedFraction
    ? `${normalizedWhole}.${normalizedFraction}`
    : normalizedWhole;

  return normalizedAmount;
};

const parseDecimalAmount = (amount: string | undefined): DecimalAmount => {
  const normalizedAmount = normalizeAmount(amount);
  const [whole = '0', fraction = ''] = normalizedAmount.split('.');
  const value = new BN(`${whole}${fraction}`.replace(/^0+/, '') || '0');

  return {
    scale: fraction.length,
    value
  };
};

const tenPow = (scale: number): BN => scale === 0 ? new BN(1) : BN_TEN.pow(new BN(scale));

const formatScaledAmount = (amount: BN, scale: number): string => {
  const paddedAmount = amount.toString().padStart(scale + 1, '0');
  const whole = scale === 0 ? paddedAmount : paddedAmount.slice(0, -scale);
  const fraction = scale === 0 ? '' : paddedAmount.slice(-scale).replace(/0+$/, '');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || '0';

  return fraction ? `${normalizedWhole}.${fraction}` : normalizedWhole;
};

const addAmounts = (left: string | undefined, right: string | undefined): string => {
  const leftAmount = parseDecimalAmount(left);
  const rightAmount = parseDecimalAmount(right);
  const scale = Math.max(leftAmount.scale, rightAmount.scale);
  const leftValue = leftAmount.value.mul(tenPow(scale - leftAmount.scale));
  const rightValue = rightAmount.value.mul(tenPow(scale - rightAmount.scale));

  return formatScaledAmount(leftValue.add(rightValue), scale);
};

const directionFromCounts = (sentCount: number, receivedCount: number): InteractionDirection =>
  sentCount > 0 && receivedCount > 0
    ? 'mixed'
    : sentCount > 0
      ? 'sent'
      : 'received';

const getCounterparty = (history: TransactionDetail, selectedId: string): { address: string; direction: Exclude<InteractionDirection, 'mixed'>; name?: string } | undefined => {
  const fromAddress = history.from?.address;
  const toAddress = history.to?.address;
  const fromId = normalizeAddress(fromAddress);
  const toId = normalizeAddress(toAddress);

  if (fromId === selectedId && toId && toAddress) {
    return {
      address: toAddress,
      direction: 'sent',
      name: history.to?.name
    };
  }

  if (toId === selectedId && fromId && fromAddress) {
    return {
      address: fromAddress,
      direction: 'received',
      name: history.from?.name
    };
  }

  return undefined;
};

export const buildInteractionGraph = (
  histories: TransactionDetail[] | null | undefined,
  selectedAddress: string | undefined,
  filters: InteractionFilters = { direction: 'all', status: 'all', type: ALL_TYPES }
): InteractionGraph => {
  if (!selectedAddress) {
    return { links: [], nodes: [] };
  }

  const selectedId = normalizeAddress(selectedAddress);

  if (!selectedId) {
    return emptyGraph(selectedAddress);
  }

  const nodes = new Map<string, InteractionNode>();
  const links = new Map<string, InteractionLink>();

  nodes.set(selectedId, {
    address: selectedAddress,
    failedCount: 0,
    id: selectedId,
    isCenter: true,
    label: toShortAddress(selectedAddress),
    receivedCount: 0,
    sentCount: 0,
    txCount: 0
  });

  histories?.forEach((history) => {
    if (
      (filters.status === 'completed' && !history.success) ||
      (filters.status === 'failed' && history.success) ||
      (filters.type !== ALL_TYPES && filters.type !== (history.subAction ?? history.action))
    ) {
      return;
    }

    const counterparty = getCounterparty(history, selectedId);
    const counterpartyId = normalizeAddress(counterparty?.address);

    if (!counterparty || !counterpartyId || counterpartyId === selectedId) {
      return;
    }

    const existingNode = nodes.get(counterpartyId);
    const sentDelta = counterparty.direction === 'sent' ? 1 : 0;
    const receivedDelta = counterparty.direction === 'received' ? 1 : 0;
    const failedDelta = history.success ? 0 : 1;
    const latestDate = Math.max(existingNode?.latestDate ?? 0, history.date ?? 0);

    nodes.set(counterpartyId, {
      address: counterparty.address,
      failedCount: (existingNode?.failedCount ?? 0) + failedDelta,
      id: counterpartyId,
      label: counterparty.name || toShortAddress(counterparty.address),
      latestDate,
      name: counterparty.name,
      receivedCount: (existingNode?.receivedCount ?? 0) + receivedDelta,
      sentCount: (existingNode?.sentCount ?? 0) + sentDelta,
      txCount: (existingNode?.txCount ?? 0) + 1
    });

    const existingLink = links.get(counterpartyId);
    const token = history.token ?? '';
    const genesisHash = history.chain?.genesisHash;
    const amount = normalizeAmount(history.amount);
    const tokens = [...(existingLink?.tokens ?? [])];
    const tokenIndex = tokens.findIndex(
      ({ genesisHash: existingGenesisHash, token: existingToken }) =>
        existingToken === token && existingGenesisHash === genesisHash
    );

    if (tokenIndex === -1) {
      tokens.push({ amount, genesisHash, token });
    } else {
      tokens[tokenIndex] = {
        ...tokens[tokenIndex],
        amount: addAmounts(tokens[tokenIndex].amount, amount)
      };
    }

    const actionType = history.subAction ?? history.action;
    const sentCount = (existingLink?.sentCount ?? 0) + sentDelta;
    const receivedCount = (existingLink?.receivedCount ?? 0) + receivedDelta;
    const direction = directionFromCounts(sentCount, receivedCount);

    links.set(counterpartyId, {
      actionTypes: Array.from(new Set([...(existingLink?.actionTypes ?? []), actionType])),
      counterparty: counterpartyId,
      direction,
      failedCount: (existingLink?.failedCount ?? 0) + failedDelta,
      id: `interaction:${selectedId}:${counterpartyId}`,
      latestDate: Math.max(existingLink?.latestDate ?? 0, history.date ?? 0),
      receivedCount,
      sentCount,
      source: direction === 'received' ? counterpartyId : selectedId,
      target: direction === 'received' ? selectedId : counterpartyId,
      tokens,
      transactions: [...(existingLink?.transactions ?? []), history],
      txCount: (existingLink?.txCount ?? 0) + 1
    });
  });

  const filteredLinks = Array.from(links.values())
    .filter(({ direction }) => filters.direction === 'all' || filters.direction === direction)
    .sort((a, b) => b.txCount - a.txCount || (b.latestDate ?? 0) - (a.latestDate ?? 0));
  const connectedIds = new Set(filteredLinks.flatMap(({ source, target }) => [source, target]));
  const center = nodes.get(selectedId);

  if (center) {
    const sentCount = filteredLinks.reduce((total, { sentCount }) => total + sentCount, 0);
    const receivedCount = filteredLinks.reduce((total, { receivedCount }) => total + receivedCount, 0);
    const failedCount = filteredLinks.reduce((total, { failedCount }) => total + failedCount, 0);

    nodes.set(selectedId, {
      ...center,
      failedCount,
      receivedCount,
      sentCount,
      txCount: sentCount + receivedCount
    });
  }

  return {
    links: filteredLinks,
    nodes: Array.from(nodes.values())
      .filter(({ id, isCenter }) => isCenter || connectedIds.has(id))
      .sort((a, b) => Number(b.isCenter) - Number(a.isCenter) || b.txCount - a.txCount)
  };
};

export const getInteractionTypes = (histories: TransactionDetail[] | null | undefined): string[] => {
  const types = new Set<string>();

  histories?.forEach((history) => types.add(history.subAction ?? history.action));

  return [ALL_TYPES, ...Array.from(types).sort()];
};
