// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

interface RouteWrapperProps {
    component: React.ComponentType;
    trigger?: string;
    props?: Record<string, unknown>;
}

const RouteWrapper = ({ component: Component, props, trigger }: RouteWrapperProps) => (
    <ErrorBoundary trigger={trigger}>
        <Component {...props} />
    </ErrorBoundary>
);

export default React.memo(RouteWrapper);
