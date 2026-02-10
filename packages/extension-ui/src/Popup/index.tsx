// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { Loading } from '@polkadot/extension-polkagate/src/components';
import { ExtensionLockProvider } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';

import PricesProvider from './contexts/PricesProvider';
import SelectedProvider from './contexts/SelectedProvider';
import AppRoutes from './routes/RouteDefinitions';
import { AccountAssetProvider, AccountIconThemeProvider, AccountProvider, ActionProvider, AlertProvider, ApiProvider, CurrencyProvider, FetchingProvider, GenesisHashOptionsProvider, MediaProvider, ReferendaProvider, RequestsProvider, SettingsProvider, UserAddedChainsProvider, WorkerProvider } from './contexts';

export default function Popup(): React.ReactElement {
  return (
    <AnimatePresence mode='wait'>
      <ExtensionLockProvider>
        <ActionProvider>
          <SettingsProvider>
            <AccountIconThemeProvider>
              <GenesisHashOptionsProvider>
                <WorkerProvider>
                  <AccountProvider>
                    <ApiProvider>
                      <AlertProvider>
                        <FetchingProvider>
                          <UserAddedChainsProvider>
                            <CurrencyProvider>
                              <PricesProvider>
                                <ReferendaProvider>
                                  <RequestsProvider>
                                    <MediaProvider>
                                      <SelectedProvider>
                                        <AccountAssetProvider>
                                          <Loading>
                                            <AppRoutes />
                                          </Loading>
                                        </AccountAssetProvider>
                                      </SelectedProvider>
                                    </MediaProvider>
                                  </RequestsProvider>
                                </ReferendaProvider>
                              </PricesProvider>
                            </CurrencyProvider>
                          </UserAddedChainsProvider>
                        </FetchingProvider>
                      </AlertProvider>
                    </ApiProvider>
                  </AccountProvider>
                </WorkerProvider>
              </GenesisHashOptionsProvider>
            </AccountIconThemeProvider>
          </SettingsProvider>
        </ActionProvider>
      </ExtensionLockProvider>
    </AnimatePresence>
  );
}
