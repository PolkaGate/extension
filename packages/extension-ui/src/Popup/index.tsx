// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { CurrencyItemType } from '@polkadot/extension-polkagate/src/fullscreen/homeFullScreen/partials/Currency';
import type { AlertType, APIs, Fetching, LatestRefs, Prices, PricesInCurrencies, UserAddedChains } from '@polkadot/extension-polkagate/src/util/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Switch, useLocation } from 'react-router';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import { canDerive } from '@polkadot/extension-base/utils';
import { ErrorBoundary, Loading } from '@polkadot/extension-polkagate/src/components';
import { AccountContext, AccountIconThemeContext, AccountsAssetsContext, ActionContext, AlertContext, APIContext, AuthorizeReqContext, CurrencyContext, FetchingContext, GenesisHashOptionsContext, MediaContext, MetadataReqContext, ReferendaContext, SettingsContext, SigningReqContext, UserAddedChainContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage, type LoginInfo, setStorage, updateStorage, watchStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { ExtensionLockProvider } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';
import AccountFS from '@polkadot/extension-polkagate/src/fullscreen/accountDetails';
import AddNewChain from '@polkadot/extension-polkagate/src/fullscreen/addNewChain';
import Governance from '@polkadot/extension-polkagate/src/fullscreen/governance';
import ReferendumPost from '@polkadot/extension-polkagate/src/fullscreen/governance/post';
import ManageIdentity from '@polkadot/extension-polkagate/src/fullscreen/manageIdentity';
import FullScreenManageProxies from '@polkadot/extension-polkagate/src/fullscreen/manageProxies';
import Onboarding from '@polkadot/extension-polkagate/src/fullscreen/onboarding';
import Send from '@polkadot/extension-polkagate/src/fullscreen/sendFund';
import SocialRecovery from '@polkadot/extension-polkagate/src/fullscreen/socialRecovery';
import Stake from '@polkadot/extension-polkagate/src/fullscreen/stake';
import PoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/pool';
import ManageValidatorsPoolfs from '@polkadot/extension-polkagate/src/fullscreen/stake/pool/commonTasks/manageValidators';
import SoloFS from '@polkadot/extension-polkagate/src/fullscreen/stake/solo';
import ManageValidators from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/commonTasks/manageValidators';
import { useGenesisHashOptions, useIsExtensionPopup, usePriceIds } from '@polkadot/extension-polkagate/src/hooks';
import useAssetsBalances, { ASSETS_NAME_IN_STORAGE, type SavedAssets } from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import { isPriceUpToDate } from '@polkadot/extension-polkagate/src/hooks/usePrices';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '@polkadot/extension-polkagate/src/messaging';
import AlertBox from '@polkadot/extension-polkagate/src/partials/AlertBox';
import AccountEx from '@polkadot/extension-polkagate/src/popup/account';
import AuthList from '@polkadot/extension-polkagate/src/popup/authManagement';
import Authorize from '@polkadot/extension-polkagate/src/popup/authorize';
import CrowdLoans from '@polkadot/extension-polkagate/src/popup/crowdloans';
import Export from '@polkadot/extension-polkagate/src/popup/export/Export';
import ExportAll from '@polkadot/extension-polkagate/src/popup/export/ExportAll';
import ForgetAccount from '@polkadot/extension-polkagate/src/popup/forgetAccount';
import History from '@polkadot/extension-polkagate/src/popup/history';
import Home from '@polkadot/extension-polkagate/src/popup/home/ManageHome';
import AddWatchOnly from '@polkadot/extension-polkagate/src/popup/import/addWatchOnly';
import AddWatchOnlyFullScreen from '@polkadot/extension-polkagate/src/popup/import/addWatchOnlyFullScreen';
import AttachQR from '@polkadot/extension-polkagate/src/popup/import/attachQR';
import AttachQrFullScreen from '@polkadot/extension-polkagate/src/popup/import/attachQrFullScreen';
import ImportLedger from '@polkadot/extension-polkagate/src/popup/import/importLedger';
import ImportProxied from '@polkadot/extension-polkagate/src/popup/import/importProxied';
import ImportProxiedFullScreen from '@polkadot/extension-polkagate/src/popup/import/importProxiedFullScreen';
import ImportRawSeed from '@polkadot/extension-polkagate/src/popup/import/importRawSeedFullScreen';
import ImportSeed from '@polkadot/extension-polkagate/src/popup/import/importSeedFullScreen';
import RestoreJson from '@polkadot/extension-polkagate/src/popup/import/restoreJSONFullScreen';
import ManageProxies from '@polkadot/extension-polkagate/src/popup/manageProxies';
import Metadata from '@polkadot/extension-polkagate/src/popup/metadata';
import CreateAccount from '@polkadot/extension-polkagate/src/popup/newAccount/createAccountFullScreen';
import Derive from '@polkadot/extension-polkagate/src/popup/newAccount/deriveAccount';
import FullscreenDerive from '@polkadot/extension-polkagate/src/popup/newAccount/deriveFromAccountsFullscreen';
import LoginPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement';
import ForgotPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement/ForgotPasswordFS';
import ResetWallet from '@polkadot/extension-polkagate/src/popup/passwordManagement/ResetFS';
import PhishingDetected from '@polkadot/extension-polkagate/src/popup/PhishingDetected';
import Receive from '@polkadot/extension-polkagate/src/popup/receive';
import Rename from '@polkadot/extension-polkagate/src/popup/rename';
import Signing from '@polkadot/extension-polkagate/src/popup/signing';
import Pool from '@polkadot/extension-polkagate/src/popup/staking/pool';
import PoolInformation from '@polkadot/extension-polkagate/src/popup/staking/pool/myPool';
import PoolNominations from '@polkadot/extension-polkagate/src/popup/staking/pool/nominations';
import PoolStake from '@polkadot/extension-polkagate/src/popup/staking/pool/stake';
import CreatePool from '@polkadot/extension-polkagate/src/popup/staking/pool/stake/createPool';
import JoinPool from '@polkadot/extension-polkagate/src/popup/staking/pool/stake/joinPool';
import PoolUnstake from '@polkadot/extension-polkagate/src/popup/staking/pool/unstake';
import Solo from '@polkadot/extension-polkagate/src/popup/staking/solo';
import FastUnstake from '@polkadot/extension-polkagate/src/popup/staking/solo/fastUnstake';
import SoloNominations from '@polkadot/extension-polkagate/src/popup/staking/solo/nominations';
import SoloRestake from '@polkadot/extension-polkagate/src/popup/staking/solo/restake';
import SoloPayout from '@polkadot/extension-polkagate/src/popup/staking/solo/rewards/PendingRewards';
import SoloStake from '@polkadot/extension-polkagate/src/popup/staking/solo/stake';
import TuneUp from '@polkadot/extension-polkagate/src/popup/staking/solo/tuneUp';
import SoloUnstake from '@polkadot/extension-polkagate/src/popup/staking/solo/unstake';
import { getPrices } from '@polkadot/extension-polkagate/src/util/api';
import { buildHierarchy } from '@polkadot/extension-polkagate/src/util/buildHierarchy';
import { DEFAULT_ACCOUNT_ICON_THEME } from '@polkadot/extension-polkagate/src/util/constants';
import uiSettings from '@polkadot/ui-settings';

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
  const isExtensionMode = useIsExtensionPopup();
  const genesisHashOptionsCtx = useGenesisHashOptions();

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

  const assetsOnChains = useAssetsBalances(accounts, setAlerts, genesisHashOptionsCtx, userAddedChainCtx);

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
    getStorage('iconTheme')
      .then((maybeTheme) => setAccountIconTheme((maybeTheme as IconTheme | undefined) || DEFAULT_ACCOUNT_ICON_THEME))
      .catch(console.error);

    watchStorage('iconTheme', setAccountIconTheme).catch(console.error);
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

  const wrapWithErrorBoundary = useCallback((component: React.ReactElement, trigger?: string): React.ReactElement => {
    return <ErrorBoundary trigger={trigger}>
      <>
        {component}
        {!isExtensionMode && <AlertBox />}
      </>
    </ErrorBoundary>;
  }, [isExtensionMode]);

  const Root = useCallback(() =>
    authRequests?.length
      ? wrapWithErrorBoundary(<Authorize />, 'authorize')
      : metaRequests?.length
        ? wrapWithErrorBoundary(<Metadata />, 'metadata')
        : signRequests?.length
          ? wrapWithErrorBoundary(<Signing />, 'signing')
          : wrapWithErrorBoundary(<Home />, 'accounts')
  , [authRequests?.length, metaRequests?.length, signRequests?.length, wrapWithErrorBoundary]);

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
                                            <Switch>
                                              <Route path='/addNewChain/'>{wrapWithErrorBoundary(<AddNewChain />, 'add-new-chain')}</Route>
                                              <Route path='/account/:genesisHash/:address/'>{wrapWithErrorBoundary(<AccountEx />, 'account')}</Route>
                                              <Route path='/account/create'>{wrapWithErrorBoundary(<CreateAccount />, 'account-creation')}</Route>
                                              <Route path='/account/export-all'>{wrapWithErrorBoundary(<ExportAll />, 'export-all-address')}</Route>
                                              <Route path='/account/import-ledger'>{wrapWithErrorBoundary(<ImportLedger />, 'import-ledger')}</Route>
                                              <Route path='/account/import-seed'>{wrapWithErrorBoundary(<ImportSeed />, 'import-seed')}</Route>
                                              <Route path='/account/import-raw-seed'>{wrapWithErrorBoundary(<ImportRawSeed />, 'import-raw-seed')}</Route>
                                              <Route path='/account/restore-json'>{wrapWithErrorBoundary(<RestoreJson />, 'restore-json')}</Route>
                                              <Route path='/accountfs/:address/:paramAssetId'>{wrapWithErrorBoundary(<AccountFS />, 'account')}</Route>
                                              <Route path='/auth-list/:id?'>{wrapWithErrorBoundary(<AuthList />, 'auth-list')}</Route>
                                              <Route path='/crowdloans/:address'>{wrapWithErrorBoundary(<CrowdLoans />, 'crowdloans')}</Route>
                                              <Route path='/derive/:address/locked'>{wrapWithErrorBoundary(<Derive isLocked />, 'derived-address-locked')}</Route>
                                              <Route path='/derive/:address'>{wrapWithErrorBoundary(<Derive />, 'derive-address')}</Route>
                                              <Route path='/export/:address'>{wrapWithErrorBoundary(<Export />, 'export-address')}</Route>
                                              <Route path='/forget/:address/:isExternal'>{wrapWithErrorBoundary(<ForgetAccount />, 'forget-address')}</Route>
                                              <Route path='/forgot-password'>{wrapWithErrorBoundary(<ForgotPassword />, 'forgot-password')}</Route>
                                              <Route path='/reset-wallet'>{wrapWithErrorBoundary(<ResetWallet />, 'reset-wallet')}</Route>
                                              <Route path='/derivefs/:address/'>{wrapWithErrorBoundary(<FullscreenDerive />, 'fullscreen-account-derive')}</Route>
                                              <Route path='/fullscreenProxyManagement/:address/'>{wrapWithErrorBoundary(<FullScreenManageProxies />, 'fullscreen-proxy-management')}</Route>
                                              <Route path='/governance/:address/:topMenu/:postId'>{wrapWithErrorBoundary(<ReferendumPost />, 'governance')}</Route>
                                              <Route path='/governance/:address/:topMenu'>{wrapWithErrorBoundary(<Governance />, 'governance')}</Route>
                                              <Route path='/history/:address'>{wrapWithErrorBoundary(<History />, 'history')}</Route>
                                              <Route path='/import/add-watch-only'>{wrapWithErrorBoundary(<AddWatchOnly />, 'import-add-watch-only')}</Route>
                                              <Route path='/import/add-watch-only-full-screen'>{wrapWithErrorBoundary(<AddWatchOnlyFullScreen />, 'import-add-watch-only-full-screen')}</Route>
                                              <Route path='/import/attach-qr'>{wrapWithErrorBoundary(<AttachQR />, 'attach-qr')}</Route>
                                              <Route path='/import/attach-qr-full-screen'>{wrapWithErrorBoundary(<AttachQrFullScreen />, 'attach-qr-full-screen')}</Route>
                                              <Route path='/import/proxied'>{wrapWithErrorBoundary(<ImportProxied />, 'import-proxied')}</Route>
                                              <Route path='/import/proxied-full-screen'>{wrapWithErrorBoundary(<ImportProxiedFullScreen />, 'import-add-watch-only-full-screen')}</Route>
                                              <Route path='/login-password'>{wrapWithErrorBoundary(<LoginPassword />, 'manage-login-password')}</Route>
                                              <Route path='/manageProxies/:address'>{wrapWithErrorBoundary(<ManageProxies />, 'manageProxies')}</Route>
                                              <Route path='/manageIdentity/:address'>{wrapWithErrorBoundary(<ManageIdentity />, 'manage-identity')}</Route>
                                              <Route path='/onboarding'>{wrapWithErrorBoundary(<Onboarding />, 'onboarding')}</Route>
                                              <Route path='/pool/create/:address'>{wrapWithErrorBoundary(<CreatePool />, 'pool-create')}</Route>
                                              <Route path='/pool/join/:address'>{wrapWithErrorBoundary(<JoinPool />, 'pool-join')}</Route>
                                              <Route path='/pool/stake/:address'>{wrapWithErrorBoundary(<PoolStake />, 'pool-stake')}</Route>
                                              <Route path='/pool/myPool/:address'>{wrapWithErrorBoundary(<PoolInformation />, 'pool-poolInfromation')}</Route>
                                              <Route path='/pool/nominations/:address'>{wrapWithErrorBoundary(<PoolNominations />, 'pool-nominations')}</Route>
                                              <Route path='/pool/unstake/:address'>{wrapWithErrorBoundary(<PoolUnstake />, 'pool-unstake')}</Route>
                                              <Route path='/pool/:address'>{wrapWithErrorBoundary(<Pool />, 'pool-staking')}</Route>
                                              <Route path='/poolfs/:address'>{wrapWithErrorBoundary(<PoolFS />, 'pool-staking-fullscreen')}</Route>
                                              <Route path='/manageValidators/:address'>{wrapWithErrorBoundary(<ManageValidators />, 'manage-validators-fullscreen')}</Route>
                                              <Route path='/managePoolValidators/:address'>{wrapWithErrorBoundary(<ManageValidatorsPoolfs />, 'manage-validators-fullscreen')}</Route>
                                              <Route path='/rename/:address'>{wrapWithErrorBoundary(<Rename />, 'rename')}</Route>
                                              <Route path='/receive/:address'>{wrapWithErrorBoundary(<Receive />, 'receive')}</Route>
                                              <Route path='/send/:address/:assetId'>{wrapWithErrorBoundary(<Send />, 'send')}</Route>
                                              <Route path='/send/:address'>{wrapWithErrorBoundary(<Send />, 'send')}</Route>
                                              <Route path='/stake/:address'>{wrapWithErrorBoundary(<Stake />, 'stake')}</Route>
                                              <Route path='/socialRecovery/:address/:closeRecovery'>{wrapWithErrorBoundary(<SocialRecovery />, 'social-recovery')}</Route>
                                              <Route path='/solo/fastUnstake/:address'>{wrapWithErrorBoundary(<FastUnstake />, 'solo-fast-unstake')}</Route>
                                              <Route path='/solo/nominations/:address'>{wrapWithErrorBoundary(<SoloNominations />, 'solo-nominations')}</Route>
                                              <Route path='/solo/payout/:address'>{wrapWithErrorBoundary(<SoloPayout />, 'solo-payout')}</Route>
                                              <Route path='/solo/restake/:address'>{wrapWithErrorBoundary(<SoloRestake />, 'solo-restake')}</Route>
                                              <Route path='/solo/stake/:address'>{wrapWithErrorBoundary(<SoloStake />, 'solo-stake')}</Route>
                                              <Route path='/solo/unstake/:address'>{wrapWithErrorBoundary(<SoloUnstake />, 'solo-unstake')}</Route>
                                              <Route path='/solo/:address'>{wrapWithErrorBoundary(<Solo />, 'solo-staking')}</Route>
                                              <Route path='/solofs/:address'>{wrapWithErrorBoundary(<SoloFS />, 'solo-staking-fullscreen')}</Route>
                                              <Route path='/tuneup/:address'>{wrapWithErrorBoundary(<TuneUp />, 'tuneup')}</Route>
                                              <Route path={`${PHISHING_PAGE_REDIRECT}/:website`}>{wrapWithErrorBoundary(<PhishingDetected />, 'phishing-page-redirect')}</Route>
                                              <Route
                                                exact
                                                path='/'
                                              >{Root}</Route>
                                            </Switch>
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
