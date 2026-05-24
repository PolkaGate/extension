// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import AccountSettings from '@polkadot//extension-polkagate/src/popup/settings/accountSettings';
import ExtensionSettings from '@polkadot//extension-polkagate/src/popup/settings/extensionSettings';
import Settings from '@polkadot/extension-polkagate/src/popup/settings';
import About from '@polkadot/extension-polkagate/src/popup/settings/about';
import Export from '@polkadot/extension-polkagate/src/popup/settings/accountSettings/Export';
import Endpoints from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/Endpoints';

/**
 * Configuration for the settings routes of the PolkaGate extension popup.
 * Each route includes a path, the associated component, and a trigger action.
 *
 * @type {RouteConfig[]}
 * @property {React.ComponentType} Component - The React component to be rendered for the route.
 * @property {string} path - The URL path for the route.
 * @property {string} trigger - The action or event that triggers the route.
 */
export const SETTINGS_ROUTES: RouteConfig[] = [
  {
    Component: Settings,
    path: '/settings',
    trigger: 'settings'
  },
  {
    Component: AccountSettings,
    path: '/settings-account/:address',
    trigger: 'settings-about'
  },
  {
    Component: ExtensionSettings,
    path: '/settings-extension/*',
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
  },
  {
    Component: Export,
    path: '/settings-account-export',
    trigger: '/account-settings'
  }
];
