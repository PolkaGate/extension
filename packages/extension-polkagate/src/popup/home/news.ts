// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

export interface News {
  version: string,
  notes: string[]
}

export const news: News[] = [
  {
    version: '0.7.0',
    notes: [
      'Support for Stablecoin Requests in Treasury: Accurately displaying requests for USDT on the Asset Hub through Governance mechanisms.',
      'Hide Numbers on Login Page: Add an option to hide numbers on the login page before logging in.',
      'Nomination Pools are evolving: New alerts for dual stakers (solo and pool) to stay on one. Unstake solo funds soon for automatic pool migration, enabling pool and governance participation without manual changes.'
    ]
  },
  {
    version: '0.6.8',
    notes: [
      'Support for Polkadot People Chain: Create and manage accounts\' on-chain identities on the Polkadot People Chain with 10 times fewer reserved tokens.',
      'Selective Account Import: Choose specific accounts to import from a JSON file.',
      'View Profiles in Extension Mode: Switch and work with profiles in extension mode, as well as in full-screen mode.',
      'Update Wallpapers: Olympic-themed wallpapers are now available for selection.'
    ]
  },
  {
    version: '0.6.4',
    notes: [
      'Support for Ledger Polkadot Generic App: The new Generic Ledger App and Migration App are now supported.',
      'Fixed People Chain Price Issue: Token prices on the People Chain are now displayed correctly.',
      'Resolve token unlock issues with Polkadot Vault: Address the problem of unlocking tokens locked in referenda using Polkadot Vault.',
      'Fixed Various UI Issues: Resolved the blinking issue on the Pool Info Page and corrected text misalignment on the Staking Reward Page.'
    ]
  },
  {
    version: '0.6.1',
    notes: [
      'Paseo Support: The Paseo testnet and its asset hub are now accessible through the wallet.',
      'Multiple Profile Accounts: An account can now be added to multiple profiles, allowing for better organization of accounts.',
      'Bug Fixes and Performance Improvements: This update enhances performance and provides a more streamlined user experience by fixing known issues.'
    ]
  }
];
