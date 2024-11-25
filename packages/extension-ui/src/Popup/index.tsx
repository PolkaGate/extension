// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { CurrencyItemType } from '@polkadot/extension-polkagate/src/fullscreen/homeFullScreen/partials/Currency';
import type { AlertType, APIs, Fetching, LatestRefs, Prices, PricesInCurrencies, UserAddedChains } from '@polkadot/extension-polkagate/src/util/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { canDerive } from '@polkadot/extension-base/utils';
import { Loading } from '@polkadot/extension-polkagate/src/components';
import { AccountContext, AccountIconThemeContext, AccountsAssetsContext, ActionContext, AlertContext, APIContext, AuthorizeReqContext, CurrencyContext, FetchingContext, GenesisHashOptionsContext, MediaContext, MetadataReqContext, ReferendaContext, SettingsContext, SigningReqContext, UserAddedChainContext, WorkerContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage, type LoginInfo, setStorage, updateStorage, watchStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { ExtensionLockProvider } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';
import { useGenesisHashOptions, useNFT, usePriceIds } from '@polkadot/extension-polkagate/src/hooks';
import useAssetsBalances, { ASSETS_NAME_IN_STORAGE, type SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import { isPriceUpToDate } from '@polkadot/extension-polkagate/src/hooks/usePrices';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '@polkadot/extension-polkagate/src/messaging';
import { getPrices } from '@polkadot/extension-polkagate/src/util/api';
import { buildHierarchy } from '@polkadot/extension-polkagate/src/util/buildHierarchy';
import { DEFAULT_ACCOUNT_ICON_THEME } from '@polkadot/extension-polkagate/src/util/constants';
import uiSettings from '@polkadot/ui-settings';

import Routes from './routes/RouteDefinitions';

const startSettings = uiSettings.get();

// Request permission for video, based on access we can hide/show import
async function requestMediaAccess (cameraOn: boolean): Promise<boolean> {
  if (!cameraOn) {
    return false;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });

    return true;
  } catch (error) {
    console.error('Permission for video declined', (error as Error).message);
  }

  return false;
}

function initAccountContext (accounts: AccountJson[]): AccountsContext {
  const hierarchy = buildHierarchy(accounts);
  const master = hierarchy.find(({ isExternal, type }) => !isExternal && canDerive(type));

  return {
    accounts,
    hierarchy,
    master
  };
}

export default function Popup (): React.ReactElement {
  const [accounts, setAccounts] = useState<null | AccountJson[]>(null);
  const priceIds = usePriceIds();
  const isFetchingPricesRef = useRef(false);
  const genesisHashOptionsCtx = useGenesisHashOptions();
  const workerRef = useRef<Worker | undefined>(undefined);

  useLocation();// just to trigger component to fix forgot pass issue

  const [accountCtx, setAccountCtx] = useState<AccountsContext>({ accounts: [], hierarchy: [] });
  const [userAddedChainCtx, setUserAddedChainCtx] = useState<UserAddedChains>({});
  const [authRequests, setAuthRequests] = useState<null | AuthorizeRequest[]>(null);
  const [cameraOn, setCameraOn] = useState(startSettings.camera === 'on');
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [metaRequests, setMetaRequests] = useState<null | MetadataRequest[]>(null);
  const [signRequests, setSignRequests] = useState<null | SigningRequest[]>(null);
  const [settingsCtx, setSettingsCtx] = useState<SettingsStruct>(startSettings);
  const [apis, setApis] = useState<APIs>({});
  const [fetching, setFetching] = useState<Fetching>({});
  const [refs, setRefs] = useState<LatestRefs>({});
  const [accountsAssets, setAccountsAssets] = useState<SavedAssets | null | undefined>();
  const [currency, setCurrency] = useState<CurrencyItemType>();
  const [accountIconTheme, setAccountIconTheme] = useState<IconTheme>(DEFAULT_ACCOUNT_ICON_THEME);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const assetsOnChains = useAssetsBalances(accounts, setAlerts, genesisHashOptionsCtx, userAddedChainCtx, workerRef.current);

  useNFT(accounts);

  const set = useCallback((change: Fetching) => {
    setFetching(change);
  }, []);

  const setIt = useCallback((change: APIs) => {
    setApis(change);
  }, []);

  const _onAction = useCallback((to?: string): void => {
    if (to) {
      window.location.hash = to;
    }
  }, []);

  useEffect(() => {
    if (!authRequests || !metaRequests || !signRequests) {
      return;
    }

    if (authRequests.length) {
      _onAction('/authorize');
    } else if (metaRequests.length) {
      _onAction('/metadata');
    } else if (signRequests.length) {
      _onAction('/signing');
    }
  }, [_onAction, authRequests, authRequests?.length, metaRequests, metaRequests?.length, signRequests, signRequests?.length]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../../extension-polkagate/src/util/workers/sharedWorker.js', import.meta.url));

    return () => {
      // Cleanup on unmount
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    getStorage('iconTheme')
      .then((maybeTheme) => setAccountIconTheme((maybeTheme as IconTheme | undefined) || DEFAULT_ACCOUNT_ICON_THEME))
      .catch(console.error);

    const unsubscribe = watchStorage('iconTheme', setAccountIconTheme);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    assetsOnChains && setAccountsAssets({ ...assetsOnChains });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetsOnChains?.timeStamp]);

  useEffect(() => {
    /** remove forgotten accounts from assetChains if any */
    if (accounts && assetsOnChains?.balances) {
      Object.keys(assetsOnChains.balances).forEach((_address) => {
        const found = accounts.find(({ address }) => address === _address);

        if (!found) {
          delete assetsOnChains.balances[_address];
          setStorage(ASSETS_NAME_IN_STORAGE, assetsOnChains, true).catch(console.error);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, assetsOnChains?.timeStamp]);

  useEffect(() => {
    if (priceIds && currency?.code && !isFetchingPricesRef.current) {
      isFetchingPricesRef.current = true;

      getStorage('pricesInCurrencies')
        .then((res) => {
          const savedPricesInCurrencies = (res || {}) as PricesInCurrencies;
          const maybeSavedPriceInCurrentCurrencyCode = savedPricesInCurrencies[currency.code];

          if (maybeSavedPriceInCurrentCurrencyCode && isPriceUpToDate(maybeSavedPriceInCurrentCurrencyCode.date)) {
            /** price in the selected currency is already updated hence no need to fetch again */
            // TODO: FixMe: what if users change selected chainS during price validity period?
            return;
          }

          getPrices(priceIds, currency.code.toLowerCase())
            .then((newPrices) => {
              delete (newPrices as Prices).currencyCode;
              savedPricesInCurrencies[currency.code] = newPrices;
              setStorage('pricesInCurrencies', savedPricesInCurrencies)
                .catch(console.error);
            })
            .catch(console.error);
        })
        .catch(console.error)
        .finally(() => {
          isFetchingPricesRef.current = false;
        });
    }
  }, [currency?.code, priceIds]);

  useEffect((): void => {
    Promise.all([
      subscribeAccounts(setAccounts),
      subscribeAuthorizeRequests(setAuthRequests),
      subscribeMetadataRequests(setMetaRequests),
      subscribeSigningRequests(setSignRequests)
    ]).catch(console.error);

    uiSettings.on('change', (settings): void => {
      setSettingsCtx(settings);
      setCameraOn(settings.camera === 'on');
    });

    getStorage('userAddedEndpoint').then((info) => {
      info && setUserAddedChainCtx(info as UserAddedChains);
    }).catch(console.error);

    _onAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchLoginInfo = async () => {
      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName === 'local' && 'loginInfo' in changes) {
          const newValue = changes['loginInfo'].newValue as LoginInfo;

          setLoginInfo(newValue);
        }
      });
      const info = await getStorage('loginInfo') as LoginInfo;

      setLoginInfo(info);
    };

    fetchLoginInfo().catch(console.error);
  }, []);

  useEffect((): void => {
    if (!loginInfo) {
      return;
    }

    if (loginInfo.status !== 'forgot') {
      setAccountCtx(initAccountContext(accounts || []));
    } else if (loginInfo.status === 'forgot') {
      setAccountCtx(initAccountContext([]));
      const addresses = accounts?.map((account) => account.address);

      updateStorage('loginInfo', { addressesToForget: addresses }).catch(console.error);
    }
  }, [accounts, loginInfo]);

  useEffect((): void => {
    requestMediaAccess(cameraOn)
      .then(setMediaAllowed)
      .catch(console.error);
  }, [cameraOn]);

  return (
    <AnimatePresence mode='wait'>
      <ExtensionLockProvider>
        <Loading>
          {
            accounts && authRequests && metaRequests && signRequests &&
            <ActionContext.Provider value={_onAction}>
              <SettingsContext.Provider value={settingsCtx}>
                <AccountIconThemeContext.Provider value={{ accountIconTheme, setAccountIconTheme }}>
                  <GenesisHashOptionsContext.Provider value={genesisHashOptionsCtx}>
                    <WorkerContext.Provider value={workerRef.current}>
                      <AccountContext.Provider value={accountCtx}>
                        <APIContext.Provider value={{ apis, setIt }}>
                          <AlertContext.Provider value={{ alerts, setAlerts }}>
                            <FetchingContext.Provider value={{ fetching, set }}>
                              <CurrencyContext.Provider value={{ currency, setCurrency }}>
                                <AccountsAssetsContext.Provider value={{ accountsAssets, setAccountsAssets }}>
                                  <ReferendaContext.Provider value={{ refs, setRefs }}>
                                    <AuthorizeReqContext.Provider value={authRequests}>
                                      <MediaContext.Provider value={cameraOn && mediaAllowed}>
                                        <MetadataReqContext.Provider value={metaRequests}>
                                          <SigningReqContext.Provider value={signRequests}>
                                            <UserAddedChainContext.Provider value={userAddedChainCtx}>
                                              <Routes />
                                            </UserAddedChainContext.Provider>
                                          </SigningReqContext.Provider>
                                        </MetadataReqContext.Provider>
                                      </MediaContext.Provider>
                                    </AuthorizeReqContext.Provider>
                                  </ReferendaContext.Provider>
                                </AccountsAssetsContext.Provider>
                              </CurrencyContext.Provider>
                            </FetchingContext.Provider>
                          </AlertContext.Provider>
                        </APIContext.Provider>
                      </AccountContext.Provider>
                    </WorkerContext.Provider>
                  </GenesisHashOptionsContext.Provider>
                </AccountIconThemeContext.Provider>
              </SettingsContext.Provider>
            </ActionContext.Provider>
          }
        </Loading>
      </ExtensionLockProvider>
    </AnimatePresence>
  );
}
