// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AccountFS from '@polkadot/extension-polkagate/src/fullscreen/accountDetails';
import HaveWallet from '@polkadot/extension-polkagate/src/fullscreen/haveWallet';
import ImportLedger from '@polkadot/extension-polkagate/src/popup/import/importLedger';
import ImportRawSeed from '@polkadot/extension-polkagate/src/popup/import/importRawSeedFullScreen';
import ImportSeed from '@polkadot/extension-polkagate/src/popup/import/importSeedFullScreen';
import RestoreJson from '@polkadot/extension-polkagate/src/popup/import/restoreJSONFullScreen';
import CreateAccount from '@polkadot/extension-polkagate/src/popup/newAccount/createAccountFullScreen';

export const ACCOUNT_ROUTES: RouteConfig[] = [
  {
    Component: CreateAccount,
    path: '/account/create',
    trigger: 'account-creation'
  },
  {
    Component: HaveWallet,
    path: '/account/have-wallet',
    trigger: 'account-creation'
  },
  {
    Component: ImportLedger,
    path: '/account/import-ledger',
    trigger: 'import-ledger'
  },
  {
    Component: ImportSeed,
    path: '/account/import-seed',
    trigger: 'import-seed'
  },
  {
    Component: ImportRawSeed,
    path: '/account/import-raw-seed',
    trigger: 'import-raw-seed'
  },
  {
    Component: RestoreJson,
    path: '/account/restore-json',
    trigger: 'restore-json'
  },
  {
    Component: AccountFS,
    path: '/accountfs/:address/:genesisHash/:paramAssetId',
    trigger: 'account'
  }
];
