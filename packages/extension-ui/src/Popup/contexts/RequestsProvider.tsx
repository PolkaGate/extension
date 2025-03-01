// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';

import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { ActionContext, AuthorizeReqContext, MetadataReqContext, SigningReqContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '@polkadot/extension-polkagate/src/messaging';

interface AuthorizationProviderProps {
  children: React.ReactNode;
}

export default function RequestsProvider({ children }: AuthorizationProviderProps) {
  const onAction = useContext(ActionContext);
  const { pathname } = useLocation();

  const [authRequests, setAuthRequests] = useState<null | AuthorizeRequest[]>(null);
  const [metaRequests, setMetaRequests] = useState<null | MetadataRequest[]>(null);
  const [signRequests, setSignRequests] = useState<null | SigningRequest[]>(null);

  useLayoutEffect(() => {
    // Use a flag to prevent race conditions
    let isMounted = true;

    const handleRouting = () => {
      if (!isMounted) {
        return;
      }

      if (!authRequests || !metaRequests || !signRequests) {
        return;
      }

      if (authRequests.length) {
        onAction('/authorize');
      } else if (metaRequests.length) {
        onAction('/metadata');
      } else if (signRequests.length) {
        onAction('/signing');
      } else if (['/authorize', '/metadata', '/signing'].includes(pathname)) {
        onAction('/');
      } else {
        onAction();
      }
    };

    handleRouting();

    return () => {
      isMounted = false;
    };
  }, [onAction, authRequests, authRequests?.length, metaRequests, metaRequests?.length, signRequests, signRequests?.length, pathname]);

  useEffect(() => {
    Promise.all([
      subscribeAuthorizeRequests(setAuthRequests),
      subscribeMetadataRequests(setMetaRequests),
      subscribeSigningRequests(setSignRequests)
    ]).catch(console.error);
  }, []);

  if (authRequests === null || metaRequests === null || signRequests === null) {
    return null;
  }

  return (
    <AuthorizeReqContext.Provider value={authRequests}>
      <MetadataReqContext.Provider value={metaRequests}>
        <SigningReqContext.Provider value={signRequests}>
          {children}
        </SigningReqContext.Provider>
      </MetadataReqContext.Provider>
    </AuthorizeReqContext.Provider>
  );
}
