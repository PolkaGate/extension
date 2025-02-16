// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import Onboarding from '@polkadot/extension-polkagate/src/fullscreen/onboarding';
import Authorize from '@polkadot/extension-polkagate/src/popup/authorize';
import Home from '@polkadot/extension-polkagate/src/popup/home/ManageHome';
import Metadata from '@polkadot/extension-polkagate/src/popup/metadata';
import Derive from '@polkadot/extension-polkagate/src/popup/newAccount/deriveAccount';
import FullscreenDerive from '@polkadot/extension-polkagate/src/popup/newAccount/deriveFromAccountsFullscreen';
import LoginPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement';
import ForgotPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement/ForgotPasswordFS';
import ResetWallet from '@polkadot/extension-polkagate/src/popup/passwordManagement/ResetFS';
import PhishingDetected from '@polkadot/extension-polkagate/src/popup/PhishingDetected';
import Signing from '@polkadot/extension-polkagate/src/popup/signing';
import Token from '@polkadot/extension-polkagate/src/popup/tokens';

import RouteWrapper from '../components/RouteWrapper';
import { ACCOUNT_ROUTES } from './accountRoutes';
import { FEATURE_ROUTES } from './featuresRoutes';
import { IMPORT_ROUTES } from './importRoutes';
import { SETTINGS_ROUTES } from './settingRoutes';
import { STAKING_ROUTES } from './stakingRoutes';

export interface RouteConfig {
  path: string;
  Component: React.ComponentType<any>;
  trigger: string;
  props?: Record<string, unknown>;
  exact?: boolean;
}

const TOKEN_ROUTE: RouteConfig[] = [
  {
    Component: Token,
    path: '/token/:genesisHash/:paramAssetId/',
    trigger: 'token'
  }
];

// Derive Routes
const DERIVE_ROUTES: RouteConfig[] = [
  {
    Component: Derive,
    path: '/derive/:address/locked',
    props: { isLocked: true },
    trigger: 'derived-address-locked'
  },
  {
    Component: Derive,
    path: '/derive/:address',
    trigger: 'derive-address'
  },
  {
    Component: FullscreenDerive,
    path: '/derivefs/:address/',
    trigger: 'fullscreen-account-derive'
  }
];

// Password Management Routes
const PASSWORD_ROUTES: RouteConfig[] = [
  {
    Component: LoginPassword,
    path: '/login-password',
    trigger: 'manage-login-password'
  },
  {
    Component: ForgotPassword,
    path: '/forgot-password',
    trigger: 'forgot-password'
  },
  {
    Component: ResetWallet,
    path: '/reset-wallet',
    trigger: 'reset-wallet'
  }
];

const ROOT_ROUTES: RouteConfig[] = [
  {
    Component: Onboarding,
    path: '/onboarding',
    trigger: 'onboarding'
  },
  {
    Component: PhishingDetected,
    path: `${PHISHING_PAGE_REDIRECT}/:website`,
    trigger: 'phishing-page-redirect'
  },
  {
    Component: Home,
    exact: true,
    path: '/',
    trigger: 'accounts'
  },
  {
    Component: Authorize,
    path: '/authorize',
    trigger: 'authorize'
  },
  {
    Component: Metadata,
    path: '/metadata',
    trigger: 'metadata'
  },
  {
    Component: Signing,
    path: '/signing',
    trigger: 'signing'
  }
];

const ALL_ROUTES: RouteConfig[] = [
  ...ACCOUNT_ROUTES,
  ...STAKING_ROUTES,
  ...IMPORT_ROUTES,
  ...FEATURE_ROUTES,
  ...DERIVE_ROUTES,
  ...PASSWORD_ROUTES,
  ...ROOT_ROUTES,
  ...SETTINGS_ROUTES,
  ...TOKEN_ROUTE
];

export default function Routes () {
  const routeComponents = useMemo(() =>
    ALL_ROUTES.map(({ Component, exact, path, props, trigger }) => (
      <Route
        exact={exact}
        key={path}
        path={path}
      >
        <RouteWrapper
          component={Component}
          props={props}
          trigger={trigger}
        />
      </Route>
    )), []);

  return (
    <Switch>
      {routeComponents}
    </Switch>
  );
}
