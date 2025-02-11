// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import Settings from '@polkadot/extension-polkagate/src/popup/settings';
import About from '@polkadot/extension-polkagate/src/popup/settings/About';
import ExtensionSettings from '@polkadot/extension-polkagate/src/popup/settings/ExtensionSettings';
import Endpoints from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/Endpoints';

interface RouteConfig {
  path: string;
  Component: React.ComponentType<any>;
  trigger: string;
  props?: Record<string, unknown>;
  exact?: boolean;
}

export const SETTINGS_ROUTES: RouteConfig[] = [
  {
    Component: Settings,
    path: '/settings',
    trigger: 'settings'
  },
  {
    Component: About,
    path: '/settings-about',
    trigger: 'settings-about'
  },
  {
    Component: ExtensionSettings,
    path: '/settings-extension',
    trigger: 'settings-extension'
  },
  {
    Component: Endpoints,
    path: '/endpoints/:genesisHash',
    trigger: '/endpoints'
  }
];