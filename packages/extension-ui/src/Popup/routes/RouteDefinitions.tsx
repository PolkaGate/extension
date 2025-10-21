// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TabProps } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';

import React, { lazy, useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import Onboarding from '@polkadot/extension-polkagate/src/fullscreen/onboarding';
import AccountsLists from '@polkadot/extension-polkagate/src/popup/accountsLists';
import Home from '@polkadot/extension-polkagate/src/popup/home/ManageHome';
import ForgotPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement/ForgotPasswordFS';
import ResetWallet from '@polkadot/extension-polkagate/src/popup/passwordManagement/ResetFS';
import PhishingDetected from '@polkadot/extension-polkagate/src/popup/PhishingDetected';
import Token from '@polkadot/extension-polkagate/src/popup/tokens';

import RouteWrapper from '../components/RouteWrapper';
import { ACCOUNT_ROUTES } from './accountRoutes';
import { FEATURE_ROUTES } from './featuresRoutes';
import { IMPORT_ROUTES } from './importRoutes';
import { NFT_ROUTES } from './nftRoutes';
import { SETTINGS_ROUTES } from './settingRoutes';
import { STAKING_ROUTES } from './stakingRoutes';

// Lazy Load main some not every day/urgent routes to avoid unnecessary delays
const Authorize = lazy(() => import('@polkadot/extension-polkagate/src/popup/authorize'));
const Metadata = lazy(() => import('@polkadot/extension-polkagate/src/popup/metadata'));
const Signing = lazy(() => import('@polkadot/extension-polkagate/src/popup/signing'));

export interface RouteConfig {
  path: string;
  Component: React.ComponentType<any>;
  trigger?: string;
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

// Password Management Routes
const PASSWORD_ROUTES: RouteConfig[] = [
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
    path: '/',
    trigger: 'accounts'
  },
  {
    Component: AccountsLists,
    path: '/accounts',
    trigger: 'accounts-list'
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
  ...PASSWORD_ROUTES,
  ...ROOT_ROUTES,
  ...SETTINGS_ROUTES,
  ...TOKEN_ROUTE,
  ...NFT_ROUTES
];

export default function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (message: TabProps, _sender: unknown, sendResponse: (response: unknown) => void) => {
      if (message?.type === 'NAVIGATE_TO') {
        navigate(`/${message.payload}`) as void;
        sendResponse({ success: true });
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [navigate]);

  const routeComponents = useMemo(() =>
    ALL_ROUTES.map(({ Component, path, props, trigger }) => (
      <Route
        element={<RouteWrapper component={Component} props={props} trigger={trigger} />}
        key={path}
        path={path}
      />
    )), []);

  return (
    <Routes>
      {routeComponents}
      {/* Catch-all fallback for unknown routes */}
      <Route element={<Navigate replace to='/' />} path='*' />
    </Routes>
  );
}
