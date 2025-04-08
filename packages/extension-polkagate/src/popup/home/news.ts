// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

export interface News {
  version: string,
  notes: string[]
}

export const news: News[] = [
  {
    version: '0.36.3',
    notes: [
      'Upgrade Ledger dependencies: Update the Ledger dependencies to the latest versions for improved performance and security.',
      'Upcoming UI Redesign: PolkaGate is getting a fresh new look—stay tuned for exciting updates!'
    ]
  },
  {
    version: '0.36.2',
    notes: [
      'Address minor issues: Fix the issue where the available balance was incorrectly set to 0 in the Polkadot API derive, along with other known issues.',
      'Upcoming UI Redesign: PolkaGate is getting a fresh new look—stay tuned for exciting updates!'
    ]
  },
  {
    version: '0.36.1',
    notes: [
      'Address minor issues: Resolve known problems to enhance the user experience and ensure compatibility with recent chain upgrades.',
      'UI Redesign Incoming: PolkaGate is getting a brand-new look—stay tuned for the upcoming update!'
    ]
  },
  {
    version: '0.36.0',
    notes: [
      'Pool Migration Support: Enable users to vote on governance using their staked funds in pools on Kusama and Polkadot.',
      'UI Redesign Incoming: PolkaGate is getting a brand-new look—stay tuned for the upcoming update!'
    ]
  },
  {
    version: '0.35.2',
    notes: [
      'Pool Migration Support: Enable users to vote on governance using their staked funds in pools on Kusama.',
      'Send Page Fix: Resolve issue where the asset ID was undefined when balances were not yet fetched.',
      'UI Redesign Incoming: PolkaGate is getting a brand-new look—stay tuned for the upcoming update!'
    ]
  },
  {
    version: '0.34.0',
    notes: [
      'Filter Inaccessible Endpoints: Exclude unresponsive RPC nodes to ensure smoother and more reliable connections.',
      'Performance Improvements: Leverage shared workers to reduce memory usage, minimize extension overhead, and boost overall performance.',
      'Fix Known Issues: Resolve known problems, including handling foreign assets on asset hubs and addressing other minor bugs.'
    ]
  },
  {
    version: '0.32.1',
    notes: [
      'Support Spanish: Access PolkaGate in your preferred language.',
      'Fix known issues: correct the Czech Republic flag display and resolve the favorite chain dialog issue.'
    ]
  },
  {
    version: '0.31.1',
    notes: [
      'Support for NFTs: View the details of your account’s NFTs.',
      'View Portfolio Price Change: Display the portfolio’s price change over the last 24 hours with an engaging count-up effect.',
      'View Governance History: Access governance histories for supported chains, alongside transfer and staking histories, on the history page.',
      'View Validators APY: Check the Annual Percentage Yield (APY) of validators to make informed and strategic selections.',
      'Set Conviction with the Slider: Easily adjust convictions in governance using the slider.'
    ]
  },
  {
    version: '0.21.6',
    notes: [
      'Show Support Us Notification: Encourage users to support us by voting for our referenda in governance.',
      'Known Issues Resolved: Removed locked amount button if no funds are locked, fixed underway votes type in the tooltip, corrected the referenda unlock modal close button, addressed vote type issues in comments, and improved the governance timeline display.'
    ]
  },
  {
    version: '0.21.1',
    notes: [
      'Show No Internet Sign: Display an icon to indicate when there’s no internet connection.',
      'Identicon Theme Selection: Allow users to choose a theme for their account identicons.',
      'Auto-Loading Referenda: Automatically load more referenda as you scroll, removing the need for manual clicks.',
      'Real-Time Referenda Search: Apply keyword-based search and filtering instantly, even while referenda are still loading.',
      'Currency Conversion Display: Show asset values in the selected currency on the governance page.'
    ]
  },
  {
    version: '0.18.2',
    notes: [
      'Add Your Chain: If your favorite chain isn’t available in the extension, you can now add it manually using an RPC endpoint address.',
      'BTC, ETH  and DOT as currency: View your token balance equivalent in BTC, ETH, DOT and other fiat currencies.',
      'Auto Mode Remote Node: RPCs are now automatically selected based on your location and latency, for optimal performance.',
      'Show Foreign Assets: Foreign assets from the asset hub, like the recent MYTH airdrop, are now displayed in the list.',
      'Show Selected Chains Badge: The number of favorite selected chains is displayed in a badge on the header in full-screen home mode.',
      'Auto Metadata Update: Metadata updates automatically in the background on supported chains, eliminating the need for manual updates.'
    ]
  },
  {
    version: '0.10.0',
    notes: [
      'Updated Transferable Balance Formula: The on-chain formula for calculating transferable balances has been updated, potentially increasing transferable balances for users with staked solo and reserved funds.',
      'Re-authorize Accounts: A popup will now request authorization for dapps when new accounts are added.',
      'Social Icons Update: Links to PolkaGate’s GitHub, Discord, and docs have been added.',
      'Vote Type Display: The vote types of referenda commenters are now visible in the comments section.',
      'Resolved Issues: Fixes include chain switching on staking pages, delegate vote tracking, unexpected account import closures, missing connected dApp icons, and profile menu bugs in extension mode.'
    ]
  },
  {
    version: '0.7.5',
    notes: [
      'Alerts now keep you informed: Notifications have been added to update you on tasks running in the background.',
      'Resolved several Ledger issues: These include fixing the missing offset in advanced mode, addressing a Kusama-related bug, and resolving a race condition when accessing the port. If you encounter issues while signing with your Ledger, please reimport your Ledger accounts.'
    ]
  },
  {
    version: '0.7.3',
    notes: [
      'Granular Access to dApps: Select specific accounts when authorizing websites to access your accounts.',
      'Show Connected dApp on Home Page: The logo appears next to the PolkaGate logo and is clickable for account management.',
      'Support for Stablecoin Requests in Treasury: Accurately display requests for USDT on the Asset Hub through governance mechanisms.',
      'Hide Numbers on Login Page: Add an option to hide numbers on the login page before logging in.',
      'Nomination Pools are Evolving: New alerts for dual stakers (solo and pool) to encourage staying with one. Unstake solo funds soon for automatic pool migration, allowing participation in pools and governance without manual changes.'
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
