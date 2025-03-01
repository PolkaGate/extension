// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { Loading } from '@polkadot/extension-polkagate/src/components';
import { ExtensionLockProvider } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';

import Routes from './routes/RouteDefinitions';
import { AccountAssetProvider, AccountIconThemeProvider, AccountProvider, ActionProvider, AlertProvider, ApiProvider, CurrencyProvider, FetchingProvider, GenesisHashOptionsProvider, MediaProvider, ReferendaProvider, RequestsProvider, SettingsProvider, UserAddedChainsProvider, WorkerProvider } from './contexts';

export default function Popup(): React.ReactElement {
  return (
    <AnimatePresence mode='wait'>
      <ExtensionLockProvider>
        <Loading>
          <ActionProvider>
            <SettingsProvider>
              <AccountIconThemeProvider>
                <GenesisHashOptionsProvider>
                  <WorkerProvider>
                    <AccountProvider>
                      <ApiProvider>
                        <AlertProvider>
                          <FetchingProvider>
                            <CurrencyProvider>
                              <ReferendaProvider>
                                <RequestsProvider>
                                  <MediaProvider>
                                    <UserAddedChainsProvider>
                                      <AccountAssetProvider>
                                        <Routes />
                                      </AccountAssetProvider>
                                    </UserAddedChainsProvider>
                                  </MediaProvider>
                                </RequestsProvider>
                              </ReferendaProvider>
                            </CurrencyProvider>
                          </FetchingProvider>
                        </AlertProvider>
                      </ApiProvider>
                    </AccountProvider>
                  </WorkerProvider>
                </GenesisHashOptionsProvider>
              </AccountIconThemeProvider>
            </SettingsProvider>
          </ActionProvider>
        </Loading>
      </ExtensionLockProvider>
    </AnimatePresence>
  );
}
