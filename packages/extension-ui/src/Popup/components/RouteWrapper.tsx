// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import ErrorBoundary from './ErrorBoundary';

interface RouteWrapperProps {
  component: React.ComponentType;
  trigger?: string;
  props?: Record<string, unknown>;
}

export default function RouteWrapper({ component: Component, props, trigger }: RouteWrapperProps) {
  return (
    <ErrorBoundary trigger={trigger}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
