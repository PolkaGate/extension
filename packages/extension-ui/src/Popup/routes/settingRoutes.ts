// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import Settings from '@polkadot/extension-polkagate/src/popup/settings';
import About from '@polkadot/extension-polkagate/src/popup/settings/About';
import AccountSettings from '@polkadot/extension-polkagate/src/popup/settings/AccountSettings';
import ExtensionSettings from '@polkadot/extension-polkagate/src/popup/settings/ExtensionSettings';
import Endpoints from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/Endpoints';

export const SETTINGS_ROUTES: RouteConfig[] = [
  {
    Component: Settings,
    path: '/settings',
    trigger: 'settings'
  },
  {
    Component: AccountSettings,
    path: '/settings-account',
    trigger: 'settings-about'
  },
  {
    Component: ExtensionSettings,
    path: '/settings-extension/',
    trigger: 'settings-extension'
  },
  {
    Component: About,
    path: '/settings-about',
    trigger: 'settings-about'
  },
  {
    Component: Endpoints,
    path: '/endpoints/:genesisHash',
    trigger: '/endpoints'
  }
];
