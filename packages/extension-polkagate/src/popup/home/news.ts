// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface News {
  version: string,
  notes: string[]
}

export const news: News[] = [
  {
    "version": "0.6.3",
    "notes": [
      "Support for Ledger Polkadot Generic App: The new Generic Ledger App and Migration App are now supported.",
      "Fixed People Chain Price Issue: Token prices on the People Chain are now displayed correctly.",
      "Resolve token unlock issues with Polkadot Vault: Address the problem of unlocking tokens locked in referenda using Polkadot Vault.",
      "Fixed Various UI Issues: Resolved the blinking issue on the Pool Info Page and corrected text misalignment on the Staking Reward Page."
    ]
  },
  {
    "version": "0.6.1",
    "notes": [
      "Paseo Support: The Paseo testnet and its asset hub are now accessible through the wallet.",
      "Multiple Profile Accounts: An account can now be added to multiple profiles, allowing for better organization of accounts.",
      "Bug Fixes and Performance Improvements: This update enhances performance and provides a more streamlined user experience by fixing known issues."
    ]
  }
]