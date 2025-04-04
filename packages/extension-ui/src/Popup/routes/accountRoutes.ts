// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AccountFS from '@polkadot/extension-polkagate/src/fullscreen/accountDetails';
import HaveWallet from '@polkadot/extension-polkagate/src/fullscreen/haveWallet';
import AccountEx from '@polkadot/extension-polkagate/src/popup/account';
import Export from '@polkadot/extension-polkagate/src/popup/export/Export';
import ExportAll from '@polkadot/extension-polkagate/src/popup/export/ExportAll';
import ForgetAccount from '@polkadot/extension-polkagate/src/popup/forgetAccount';
import ImportLedger from '@polkadot/extension-polkagate/src/popup/import/importLedger';
import ImportRawSeed from '@polkadot/extension-polkagate/src/popup/import/importRawSeedFullScreen';
import ImportSeed from '@polkadot/extension-polkagate/src/popup/import/importSeedFullScreen';
import RestoreJson from '@polkadot/extension-polkagate/src/popup/import/restoreJSONFullScreen';
import CreateAccount from '@polkadot/extension-polkagate/src/popup/newAccount/createAccountFullScreen';
import Receive from '@polkadot/extension-polkagate/src/popup/receive';
import Rename from '@polkadot/extension-polkagate/src/popup/rename';

export const ACCOUNT_ROUTES: RouteConfig[] = [
  {
    Component: AccountEx,
    path: '/account/:genesisHash/:address/',
    trigger: 'account'
  },
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
    Component: ExportAll,
    path: '/account/export-all',
    trigger: 'export-all-address'
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
    path: '/accountfs/:address/:paramAssetId',
    trigger: 'account'
  },
  {
    Component: Export,
    path: '/export/:address',
    trigger: 'export-address'
  },
  {
    Component: ForgetAccount,
    path: '/forget/:address/:isExternal',
    trigger: 'forget-address'
  },
  {
    Component: Rename,
    path: '/rename/:address',
    trigger: 'rename'
  },
  {
    Component: Receive,
    path: '/receive',
    trigger: 'receive'
  }
];
