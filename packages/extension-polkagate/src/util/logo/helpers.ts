// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import getNetworkMap from '../getNetworkMap';

export function colorFromString(input: string): string {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  return `hsl(${Math.abs(hash) % 360}, 100%, 50%)`;
}

export function normalizeToWordKey(input: string | undefined): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .map((word) => word.toLowerCase())
    .filter(Boolean)
    .sort()
    .join(' ');
}

export function mayGetChainName(info: string | undefined | null): string | undefined {
  const networkMap = getNetworkMap();

  let chainNameFromGenesisHash = networkMap.get(info || '');

  if (!chainNameFromGenesisHash) {
    const entry = Array.from(networkMap.entries())
      .find(([, value]) => value.toLowerCase() === (info || '').toLowerCase());

    chainNameFromGenesisHash = entry?.[1];
  }

  return chainNameFromGenesisHash;
}
