// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface StakingRecommended {
  rates: Record<string, number>;
  validators: Record<string, string[]>;
}

/**
 * Fetches staking information from a remote JSON file.
 * @returns A promise that resolves with staking rates and recommended validators.
 * @throws An error if the fetch request fails.
 */
export async function fetchStaking(): Promise<StakingRecommended> {
  const response = await fetch('https://raw.githubusercontent.com/PolkaGate/snap/refs/heads/main/packages/snap/staking.json');

  if (!response.ok) {
    throw new Error('Failed to fetch staking JSON file');
  }

  const info = (await response.json()) as StakingRecommended;

  return info;
}
