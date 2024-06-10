// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Switch, useLocation } from 'react-router';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import { canDerive } from '@polkadot/extension-base/utils';
import AccountFS from '@polkadot/extension-polkagate/src/fullscreen/accountDetails';
import Governance from '@polkadot/extension-polkagate/src/fullscreen/governance';
import ReferendumPost from '@polkadot/extension-polkagate/src/fullscreen/governance/post';
import { CurrencyItemType } from '@polkadot/extension-polkagate/src/fullscreen/homeFullScreen/partials/Currency';
import ManageIdentity from '@polkadot/extension-polkagate/src/fullscreen/manageIdentity';
import FullScreenManageProxies from '@polkadot/extension-polkagate/src/fullscreen/manageProxies';
import Send from '@polkadot/extension-polkagate/src/fullscreen/sendFund';
import SocialRecovery from '@polkadot/extension-polkagate/src/fullscreen/socialRecovery';
import Stake from '@polkadot/extension-polkagate/src/fullscreen/stake';
import PoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/pool';
import ManageValidatorsPoolfs from '@polkadot/extension-polkagate/src/fullscreen/stake/pool/commonTasks/manageValidators';
import SoloFS from '@polkadot/extension-polkagate/src/fullscreen/stake/solo';
import ManageValidators from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/commonTasks/manageValidators';
import { isPriceUpToDate } from '@polkadot/extension-polkagate/src/hooks/usePrices';
import AddWatchOnly from '@polkadot/extension-polkagate/src/popup/import/addWatchOnly';
import Derive from '@polkadot/extension-polkagate/src/popup/newAccount/deriveAccount';
import FullscreenDerive from '@polkadot/extension-polkagate/src/popup/newAccount/deriveFromAccountsFullscreen';
import LoginPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement';
import ForgotPassword from '@polkadot/extension-polkagate/src/popup/passwordManagement/ForgotPasswordFS';
import ResetWallet from '@polkadot/extension-polkagate/src/popup/passwordManagement/ResetFS';
import uiSettings from '@polkadot/ui-settings';

import { ErrorBoundary, Loading } from '../../../extension-polkagate/src/components';
import { AccountContext, AccountsAssetsContext, ActionContext, APIContext, AuthorizeReqContext, CurrencyContext, FetchingContext, MediaContext, MetadataReqContext, ReferendaContext, SettingsContext, SigningReqContext } from '../../../extension-polkagate/src/components/contexts';
import { getStorage, LoginInfo, setStorage, updateStorage } from '../../../extension-polkagate/src/components/Loading';
import { ExtensionLockProvider } from '../../../extension-polkagate/src/context/ExtensionLockContext';
import Onboarding from '../../../extension-polkagate/src/fullscreen/onboarding';
import { usePriceIds, useUpdateMetadata } from '../../../extension-polkagate/src/hooks';
import useAssetsBalances, { ASSETS_NAME_IN_STORAGE, SavedAssets } from '../../../extension-polkagate/src/hooks/useAssetsBalances';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '../../../extension-polkagate/src/messaging';
import AccountEx from '../../../extension-polkagate/src/popup/account';
import AuthList from '../../../extension-polkagate/src/popup/authManagement';
import Authorize from '../../../extension-polkagate/src/popup/authorize/index';
import CrowdLoans from '../../../extension-polkagate/src/popup/crowdloans';
import Export from '../../../extension-polkagate/src/popup/export/Export';
import ExportAll from '../../../extension-polkagate/src/popup/export/ExportAll';
import ForgetAccount from '../../../extension-polkagate/src/popup/forgetAccount';
import History from '../../../extension-polkagate/src/popup/history';
import Accounts from '../../../extension-polkagate/src/popup/home/ManageHome';
import AddWatchOnlyFullScreen from '../../../extension-polkagate/src/popup/import/addWatchOnlyFullScreen';
import AttachQR from '../../../extension-polkagate/src/popup/import/attachQR';
import AttachQrFullScreen from '../../../extension-polkagate/src/popup/import/attachQrFullScreen';
import ImportLedger from '../../../extension-polkagate/src/popup/import/importLedger';
import ImportProxied from '../../../extension-polkagate/src/popup/import/importProxied';
import ImportProxiedFullScreen from '../../../extension-polkagate/src/popup/import/importProxiedFullScreen';
import ImportRawSeed from '../../../extension-polkagate/src/popup/import/importRawSeedFullScreen';
import ImportSeed from '../../../extension-polkagate/src/popup/import/importSeedFullScreen';
import RestoreJson from '../../../extension-polkagate/src/popup/import/restoreJSONFullScreen';
import ManageProxies from '../../../extension-polkagate/src/popup/manageProxies';
import Metadata from '../../../extension-polkagate/src/popup/metadata';
import CreateAccount from '../../../extension-polkagate/src/popup/newAccount/createAccountFullScreen';
import PhishingDetected from '../../../extension-polkagate/src/popup/PhishingDetected';
import Receive from '../../../extension-polkagate/src/popup/receive';
import Rename from '../../../extension-polkagate/src/popup/rename';
import Signing from '../../../extension-polkagate/src/popup/signing';
import Pool from '../../../extension-polkagate/src/popup/staking/pool';
import PoolInformation from '../../../extension-polkagate/src/popup/staking/pool/myPool';
import PoolNominations from '../../../extension-polkagate/src/popup/staking/pool/nominations';
import PoolStake from '../../../extension-polkagate/src/popup/staking/pool/stake';
import CreatePool from '../../../extension-polkagate/src/popup/staking/pool/stake/createPool';
import JoinPool from '../../../extension-polkagate/src/popup/staking/pool/stake/joinPool';
import PoolUnstake from '../../../extension-polkagate/src/popup/staking/pool/unstake';
import Solo from '../../../extension-polkagate/src/popup/staking/solo';
import FastUnstake from '../../../extension-polkagate/src/popup/staking/solo/fastUnstake';
import SoloNominations from '../../../extension-polkagate/src/popup/staking/solo/nominations';
import SoloRestake from '../../../extension-polkagate/src/popup/staking/solo/restake';
import SoloPayout from '../../../extension-polkagate/src/popup/staking/solo/rewards/PendingRewards';
import SoloStake from '../../../extension-polkagate/src/popup/staking/solo/stake';
import TuneUp from '../../../extension-polkagate/src/popup/staking/solo/tuneUp';
import SoloUnstake from '../../../extension-polkagate/src/popup/staking/solo/unstake';
import { getPrices } from '../../../extension-polkagate/src/util/api';
import { buildHierarchy } from '../../../extension-polkagate/src/util/buildHierarchy';
import { APIs, Fetching, LatestRefs, Prices, PricesInCurrencies } from '../../../extension-polkagate/src/util/types';

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
  const assetsOnChains = useAssetsBalances(accounts);
  const priceIds = usePriceIds();
  const isFetchingPricesRef = useRef(false);

  useLocation();// just to trigger component to fix forgot pass issue

  const [accountCtx, setAccountCtx] = useState<AccountsContext>({ accounts: [], hierarchy: [] });
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
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();

  useUpdateMetadata(accountCtx.accounts, apis);

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
    assetsOnChains && setAccountsAssets(assetsOnChains);
  }, [assetsOnChains]);

  useEffect(() => {
    /** remove forgotten accounts from assetChains if any */
    if (accounts && assetsOnChains?.balances) {
      Object.keys(assetsOnChains.balances).forEach((_address) => {
        const found = accounts.find(({ address }) => address === _address);

        !found && delete assetsOnChains.balances[_address];
        setStorage(ASSETS_NAME_IN_STORAGE, assetsOnChains, true).catch(console.error);
      });
    }
  }, [accounts, assetsOnChains]);

  useEffect(() => {
    if (priceIds && currency?.code && !isFetchingPricesRef.current) {
      isFetchingPricesRef.current = true;

      getStorage('pricesInCurrencies')
        .then((res) => {
          const savedPricesInCurrencies = (res || {}) as PricesInCurrencies;
          const mayBeSavedPriceInCurrentCurrencyCode = savedPricesInCurrencies[currency.code];

          if (mayBeSavedPriceInCurrentCurrencyCode && isPriceUpToDate(mayBeSavedPriceInCurrentCurrencyCode.date)) {
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

    _onAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchLoginInfo = async () => {
      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName === 'local' && 'loginInfo' in changes) {
          const newValue = changes.loginInfo.newValue as LoginInfo;

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

  function wrapWithErrorBoundary (component: React.ReactElement, trigger?: string): React.ReactElement {
    return <ErrorBoundary trigger={trigger}>{component}</ErrorBoundary>;
  }

  const Root = authRequests && authRequests.length
    ? wrapWithErrorBoundary(<Authorize />, 'authorize')
    : metaRequests && metaRequests.length
      ? wrapWithErrorBoundary(<Metadata />, 'metadata')
      : signRequests && signRequests.length
        ? wrapWithErrorBoundary(<Signing />, 'signing')
        : wrapWithErrorBoundary(<Accounts />, 'accounts');

  return (
    <AnimatePresence mode='wait'>
      <ExtensionLockProvider>
        <Loading>{accounts && authRequests && metaRequests && signRequests &&
          <ActionContext.Provider value={_onAction}>
            <SettingsContext.Provider value={settingsCtx}>
              <AccountContext.Provider value={accountCtx}>
                <APIContext.Provider value={{ apis, setIt }}>
                  <FetchingContext.Provider value={{ fetching, set }}>
                    <CurrencyContext.Provider value={{ currency, setCurrency }}>
                      <AccountsAssetsContext.Provider value={{ accountsAssets, setAccountsAssets }}>
                        <ReferendaContext.Provider value={{ refs, setRefs }}>
                          <AuthorizeReqContext.Provider value={authRequests}>
                            <MediaContext.Provider value={cameraOn && mediaAllowed}>
                              <MetadataReqContext.Provider value={metaRequests}>
                                <SigningReqContext.Provider value={signRequests}>
                                  <Switch>
                                    <Route path='/account/:genesisHash/:address/'>{wrapWithErrorBoundary(<AccountEx />, 'account')}</Route>
                                    <Route path='/account/create'>{wrapWithErrorBoundary(<CreateAccount />, 'account-creation')}</Route>
                                    <Route path='/account/export-all'>{wrapWithErrorBoundary(<ExportAll />, 'export-all-address')}</Route>
                                    <Route path='/account/import-ledger'>{wrapWithErrorBoundary(<ImportLedger />, 'import-ledger')}</Route>
                                    <Route path='/account/import-seed'>{wrapWithErrorBoundary(<ImportSeed />, 'import-seed')}</Route>
                                    <Route path='/account/import-raw-seed'>{wrapWithErrorBoundary(<ImportRawSeed />, 'import-raw-seed')}</Route>
                                    <Route path='/account/restore-json'>{wrapWithErrorBoundary(<RestoreJson />, 'restore-json')}</Route>
                                    <Route path='/accountfs/:address/:paramAssetId'>{wrapWithErrorBoundary(<AccountFS />, 'account')}</Route>
                                    <Route path='/auth-list'>{wrapWithErrorBoundary(<AuthList />, 'auth-list')}</Route>
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
                                </SigningReqContext.Provider>
                              </MetadataReqContext.Provider>
                            </MediaContext.Provider>
                          </AuthorizeReqContext.Provider>
                        </ReferendaContext.Provider>
                      </AccountsAssetsContext.Provider>
                    </CurrencyContext.Provider>
                  </FetchingContext.Provider>
                </APIContext.Provider>
              </AccountContext.Provider>
            </SettingsContext.Provider>
          </ActionContext.Provider>
        }</Loading>
      </ExtensionLockProvider>
    </AnimatePresence>
  );
}
