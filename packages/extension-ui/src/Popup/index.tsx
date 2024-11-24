// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

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
import NFTAlbum from '@polkadot/extension-polkagate/src/fullscreen/nft';
import Onboarding from '@polkadot/extension-polkagate/src/fullscreen/onboarding';
import Send from '@polkadot/extension-polkagate/src/fullscreen/sendFund';
import SocialRecovery from '@polkadot/extension-polkagate/src/fullscreen/socialRecovery';
import Stake from '@polkadot/extension-polkagate/src/fullscreen/stake';
import PoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/pool';
import ManageValidatorsPoolfs from '@polkadot/extension-polkagate/src/fullscreen/stake/pool/commonTasks/manageValidators';
import SoloFS from '@polkadot/extension-polkagate/src/fullscreen/stake/solo';
import ManageValidators from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/commonTasks/manageValidators';
import { useGenesisHashOptions, useIsExtensionPopup, useNFT, usePriceIds } from '@polkadot/extension-polkagate/src/hooks';
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

interface WrapWithErrorBoundaryProps {
  children: React.ReactElement;
  isExtensionMode: boolean;
  trigger?: string;
}

const WrapWithErrorBoundary = React.memo(function WrapWithErrorBoundary ({ children, isExtensionMode, trigger }: WrapWithErrorBoundaryProps): React.ReactElement {
  return (
    <ErrorBoundary trigger={trigger}>
      <>
        {children}
        {!isExtensionMode && <AlertBox />}
      </>
    </ErrorBoundary>
  );
});

interface RootProps {
  hasAuthRequest: boolean;
  isExtensionMode: boolean;
  hasMetaRequest: boolean;
  hasSignRequest: boolean;
}

const Root = React.memo(function Root ({ hasAuthRequest, hasMetaRequest, hasSignRequest, isExtensionMode }: RootProps) {
  return (
    hasAuthRequest
      ? <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='authorize'>
        <Authorize />
      </WrapWithErrorBoundary>
      : hasMetaRequest
        ? <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='metadata'>
          <Metadata />
        </WrapWithErrorBoundary>
        : hasSignRequest
          ? <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='signing'>
            <Signing />
          </WrapWithErrorBoundary>
          : <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='accounts'>
            <Home />
          </WrapWithErrorBoundary>
  );
});

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
                                              <Route path='/addNewChain/'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='add-new-chain'>
                                                  <AddNewChain />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/:genesisHash/:address/'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='account'>
                                                  <AccountEx />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/create'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='account-creation'>
                                                  <CreateAccount />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/export-all'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='export-all-address'>
                                                  <ExportAll />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/import-ledger'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-ledger'>
                                                  <ImportLedger />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/import-seed'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-seed'>
                                                  <ImportSeed />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/import-raw-seed'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-raw-seed'>
                                                  <ImportRawSeed />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/account/restore-json'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='restore-json'>
                                                  <RestoreJson />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/accountfs/:address/:paramAssetId'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='account-full-screen'>
                                                  <AccountFS />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/auth-list/:id?'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='auth-list'>
                                                  <AuthList />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/crowdloans/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='crowdloans'>
                                                  <CrowdLoans />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/derive/:address/locked'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='derived-address-locked'>
                                                  <Derive isLocked />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/derive/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='derive-address'>
                                                  <Derive />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/derivefs/:address/'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='fullscreen-account-derive'>
                                                  <FullscreenDerive />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/export/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='export-address'>
                                                  <Export />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/forget/:address/:isExternal'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='forget-address'>
                                                  <ForgetAccount />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/forgot-password'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='forgot-password'>
                                                  <ForgotPassword />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/reset-wallet'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='reset-wallet'>
                                                  <ResetWallet />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/fullscreenProxyManagement/:address/'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='fullscreen-proxy-management'>
                                                  <FullScreenManageProxies />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/governance/:address/:topMenu/:postId'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='governance-ref'>
                                                  <ReferendumPost />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/governance/:address/:topMenu'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='signing'>
                                                  <Governance />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/history/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='history'>
                                                  <History />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/import/add-watch-only'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-add-watch-only'>
                                                  <AddWatchOnly />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/import/add-watch-only-full-screen'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-add-watch-only-full-screen'>
                                                  <AddWatchOnlyFullScreen />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/import/attach-qr'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='attach-qr'>
                                                  <AttachQR />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/import/attach-qr-full-screen'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='attach-qr-full-screen'>
                                                  <AttachQrFullScreen />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/import/proxied'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-proxied'>
                                                  <ImportProxied />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/import/proxied-full-screen'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='import-proxied-full-screen'>
                                                  <ImportProxiedFullScreen />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/login-password'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='manage-login-password'>
                                                  <LoginPassword />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/manageProxies/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='manageProxies'>
                                                  <ManageProxies />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/manageIdentity/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='manage-identity'>
                                                  <ManageIdentity />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/manageValidators/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='manage-validators-fullscreen'>
                                                  <ManageValidators />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/managePoolValidators/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='manage-pool-validators-fullscreen'>
                                                  <ManageValidatorsPoolfs />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/nft/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='nft-album'>
                                                  <NFTAlbum />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/onboarding'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='onboarding'>
                                                  <Onboarding />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/create/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-create'>
                                                  <CreatePool />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/join/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-join'>
                                                  <JoinPool />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/stake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-stake'>
                                                  <PoolStake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/myPool/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-information'>
                                                  <PoolInformation />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/nominations/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-nominations'>
                                                  <PoolNominations />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/unstake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-unstake'>
                                                  <PoolUnstake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/pool/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-staking'>
                                                  <Pool />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/poolfs/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='pool-staking-fullscreen'>
                                                  <PoolFS />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/rename/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='rename'>
                                                  <Rename />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/receive/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='sign-receiving'>
                                                  <Receive />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/send/:address/:assetId'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='send-full-screen'>
                                                  <Send />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/send/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='send'>
                                                  <Send />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/stake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='stake'>
                                                  <Stake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/socialRecovery/:address/:closeRecovery'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='social-recovery'>
                                                  <SocialRecovery />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/fastUnstake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-fast-unstake'>
                                                  <FastUnstake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/nominations/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-nominations'>
                                                  <SoloNominations />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/payout/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-payout'>
                                                  <SoloPayout />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/restake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-restake'>
                                                  <SoloRestake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/stake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-stake'>
                                                  <SoloStake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/unstake/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-unstake'>
                                                  <SoloUnstake />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solo/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-staking'>
                                                  <Solo />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/solofs/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='solo-staking-fullscreen'>
                                                  <SoloFS />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path='/tuneup/:address'>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='tuneup'>
                                                  <TuneUp />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route path={`${PHISHING_PAGE_REDIRECT}/:website`}>
                                                <WrapWithErrorBoundary isExtensionMode={isExtensionMode} trigger='phishing-page-redirect'>
                                                  <PhishingDetected />
                                                </WrapWithErrorBoundary>
                                              </Route>
                                              <Route exact path='/'>
                                                <Root
                                                  hasAuthRequest={!!authRequests.length}
                                                  hasMetaRequest={!!metaRequests.length}
                                                  hasSignRequest={!!signRequests.length}
                                                  isExtensionMode={isExtensionMode}
                                                />
                                              </Route>
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
