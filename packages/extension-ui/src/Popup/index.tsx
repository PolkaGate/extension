// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import { canDerive } from '@polkadot/extension-base/utils';
import uiSettings from '@polkadot/ui-settings';

import { ErrorBoundary, Loading } from '../components';
import { AccountContext, ActionContext, APIContext, AuthorizeReqContext, FetchingContext, MediaContext, MetadataReqContext, ReferendaContext, SettingsContext, SigningReqContext } from '../components/contexts';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '../messaging';
import Account from './account';
import AuthList from './authManagement';
import Authorize from './authorize/index';
import CreateAccount from './createAccountFullScreen';
import CrowdLoans from './crowdloans';
import Derive from './deriveAccount';
import Export from './export/Export';
import ExportAll from './export/ExportAll';
import ForgetAccount from './forgetAccount';
import Governance from './governance';
import ReferendumPost from './governance/post';
import History from './history';
import Accounts from './home';
import AddAddressOnly from './import/addAddressOnly';
import AttachQR from './import/attachQR';
import ImportLedger from './import/importLedger';
import ImportSeed from './import/importSeedFullScreen';
import RestoreJson from './import/restoreJSONFullScreen';
import ManageIdentity from './manageIdentity';
import ManageProxies from './manageProxies';
import Metadata from './metadata';
import PhishingDetected from './PhishingDetected';
import Receive from './receive';
import Rename from './rename';
import Send from './sendFund';
import Signing from './signing';
import SocialRecovery from './socialRecovery';
import Pool from './staking/pool';
import PoolInformation from './staking/pool/myPool';
import PoolNominations from './staking/pool/nominations';
import PoolStake from './staking/pool/stake';
import CreatePool from './staking/pool/stake/createPool';
import JoinPool from './staking/pool/stake/joinPool';
import PoolUnstake from './staking/pool/unstake';
import Solo from './staking/solo';
import FastUnstake from './staking/solo/fastUnstake';
import SoloNominations from './staking/solo/nominations';
import SoloRestake from './staking/solo/restake';
import SoloPayout from './staking/solo/rewards/PendingRewards';
import SoloStake from './staking/solo/stake';
import TuneUp from './staking/solo/tuneUp';
import SoloUnstake from './staking/solo/unstake';
import { buildHierarchy } from '../util/buildHierarchy';
import type { APIs, Fetching, LatestRefs } from '../util/types';

const startSettings = uiSettings.get();

// Request permission for video, based on access we can hide/show import
async function requestMediaAccess(cameraOn: boolean): Promise<boolean> {
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

function initAccountContext(accounts: AccountJson[]): AccountsContext {
  const hierarchy = buildHierarchy(accounts);
  const master = hierarchy.find(({ isExternal, type }) => !isExternal && canDerive(type));

  return {
    accounts,
    hierarchy,
    master
  };
}

export default function Popup(): React.ReactElement {
  const [accounts, setAccounts] = useState<null | AccountJson[]>(null);
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

  /** To save current page url */
  // if (window.location.hash !== '#/') {
  //   window.localStorage.setItem('last_url', JSON.stringify({ time: Date.now(), url: window.location.hash }));
  // }

  /** To LOAD last saved page url */
  // useEffect(() => {
  //   const lastUrlInfo = window.localStorage.getItem('last_url');

  //   if (lastUrlInfo) {
  //     const info = JSON.parse(lastUrlInfo) as { time: number, url: string };

  //     if (Date.now() - info.time < MILLISECONDS_TO_UPDATE) {
  //       /** TODO: this url replacement is disabled until finding a way to handle Authorize and transactions popups/pages */
  //       // window.location.hash = info.url;
  //     }
  //   }
  // }, []);

  const set = useCallback((change: Fetching) => {
    setFetching(change);
  }, []);

  const setIt = useCallback((change: APIs) => {
    setApis(change);
  }, []);

  const _onAction = useCallback(
    (to?: string): void => {
      if (to) {
        window.location.hash = to;
      }
    },
    []
  );

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

  useEffect((): void => {
    setAccountCtx(initAccountContext(accounts || []));
  }, [accounts]);

  useEffect((): void => {
    requestMediaAccess(cameraOn)
      .then(setMediaAllowed)
      .catch(console.error);
  }, [cameraOn]);

  function wrapWithErrorBoundary(component: React.ReactElement, trigger?: string): React.ReactElement {
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
      <Loading>{accounts && authRequests && metaRequests && signRequests &&
        <ActionContext.Provider value={_onAction}>
          <SettingsContext.Provider value={settingsCtx}>
            <AccountContext.Provider value={accountCtx}>
              <APIContext.Provider value={{ apis, setIt }}>
                <FetchingContext.Provider value={{ fetching, set }}>
                  <ReferendaContext.Provider value={{ refs, setRefs }}>
                    <AuthorizeReqContext.Provider value={authRequests}>
                      <MediaContext.Provider value={cameraOn && mediaAllowed}>
                        <MetadataReqContext.Provider value={metaRequests}>
                          <SigningReqContext.Provider value={signRequests}>
                            <Switch>
                              <Route path='/crowdloans/:address'>{wrapWithErrorBoundary(<CrowdLoans />, 'crowdloans')}</Route>
                              <Route path='/rename/:address'>{wrapWithErrorBoundary(<Rename />, 'rename')}</Route>
                              <Route path='/governance/:address/:topMenu/:postId'>{wrapWithErrorBoundary(<ReferendumPost />, 'governance')}</Route>
                              <Route path='/governance/:address/:topMenu'>{wrapWithErrorBoundary(<Governance />, 'governance')}</Route>
                              <Route path='/manageProxies/:address'>{wrapWithErrorBoundary(<ManageProxies />, 'manageProxies')}</Route>
                              <Route path='/history/:address'>{wrapWithErrorBoundary(<History />, 'history')}</Route>
                              <Route path='/receive/:address'>{wrapWithErrorBoundary(<Receive />, 'receive')}</Route>
                              <Route path='/pool/myPool/:address'>{wrapWithErrorBoundary(<PoolInformation />, 'pool-poolInfromation')}</Route>
                              <Route path='/pool/stake/:address'>{wrapWithErrorBoundary(<PoolStake />, 'pool-stake')}</Route>
                              <Route path='/solo/stake/:address'>{wrapWithErrorBoundary(<SoloStake />, 'solo-stake')}</Route>
                              <Route path='/pool/unstake/:address'>{wrapWithErrorBoundary(<PoolUnstake />, 'pool-unstake')}</Route>
                              <Route path='/solo/unstake/:address'>{wrapWithErrorBoundary(<SoloUnstake />, 'solo-unstake')}</Route>
                              <Route path='/solo/fastUnstake/:address'>{wrapWithErrorBoundary(<FastUnstake />, 'solo-fast-unstake')}</Route>
                              <Route path='/solo/restake/:address'>{wrapWithErrorBoundary(<SoloRestake />, 'solo-restake')}</Route>
                              <Route path='/solo/payout/:address'>{wrapWithErrorBoundary(<SoloPayout />, 'solo-payout')}</Route>
                              <Route path='/pool/join/:address'>{wrapWithErrorBoundary(<JoinPool />, 'pool-join')}</Route>
                              <Route path='/pool/create/:address'>{wrapWithErrorBoundary(<CreatePool />, 'pool-create')}</Route>
                              <Route path='/pool/nominations/:address'>{wrapWithErrorBoundary(<PoolNominations />, 'pool-nominations')}</Route>
                              <Route path='/solo/nominations/:address'>{wrapWithErrorBoundary(<SoloNominations />, 'solo-nominations')}</Route>
                              <Route path='/pool/:address'>{wrapWithErrorBoundary(<Pool />, 'pool-staking')}</Route>
                              <Route path='/solo/:address'>{wrapWithErrorBoundary(<Solo />, 'solo-staking')}</Route>
                              <Route path='/tuneup/:address'>{wrapWithErrorBoundary(<TuneUp />, 'tuneup')}</Route>
                              <Route path='/manageIdentity/:address'>{wrapWithErrorBoundary(<ManageIdentity />, 'manage-identity')}</Route>
                              <Route path='/socialRecovery/:address/:closeRecovery'>{wrapWithErrorBoundary(<SocialRecovery />, 'social-recovery')}</Route>
                              <Route exact path='/account/:genesisHash/:address/'>{wrapWithErrorBoundary(<Account />, 'account')}</Route>
                              <Route exact path='/send/:address'>{wrapWithErrorBoundary(<Send />, 'send')}</Route>
                              <Route exact path='/send/:address/:assetId'>{wrapWithErrorBoundary(<Send />, 'send')}</Route>
                              {/* <Route exact path='/send/review/:genesisHash/:address/:formatted/:assetId'>{wrapWithErrorBoundary(<Review />, 'review')}</Route> */}
                              <Route path='/auth-list'>{wrapWithErrorBoundary(<AuthList />, 'auth-list')}</Route>
                              <Route path='/import/add-address-only'>{wrapWithErrorBoundary(<AddAddressOnly />, 'import-add-address-only')}</Route>
                              <Route path='/account/create'>{wrapWithErrorBoundary(<CreateAccount />, 'account-creation')}</Route>
                              <Route exact path='/forget/:address/:isExternal'>{wrapWithErrorBoundary(<ForgetAccount />, 'forget-address')}</Route>
                              <Route exact path='/export/:address'>{wrapWithErrorBoundary(<Export />, 'export-address')}</Route>
                              <Route path='/account/export-all'>{wrapWithErrorBoundary(<ExportAll />, 'export-all-address')}</Route>
                              <Route path='/account/import-ledger'>{wrapWithErrorBoundary(<ImportLedger />, 'import-ledger')}</Route>
                              <Route path='/import/attach-qr'>{wrapWithErrorBoundary(<AttachQR />, 'attach-qr')}</Route>
                              <Route path='/account/import-seed'>{wrapWithErrorBoundary(<ImportSeed />, 'import-seed')}</Route>
                              <Route path='/account/restore-json'>{wrapWithErrorBoundary(<RestoreJson />, 'restore-json')}</Route>
                              <Route path='/derive/:address/locked'>{wrapWithErrorBoundary(<Derive isLocked />, 'derived-address-locked')}</Route>
                              <Route path='/derive/:address'>{wrapWithErrorBoundary(<Derive />, 'derive-address')}</Route>
                              <Route path={`${PHISHING_PAGE_REDIRECT}/:website`}>{wrapWithErrorBoundary(<PhishingDetected />, 'phishing-page-redirect')}</Route>
                              <Route
                                exact
                                path='/'
                              >
                                {Root}
                              </Route>
                            </Switch>
                          </SigningReqContext.Provider>
                        </MetadataReqContext.Provider>
                      </MediaContext.Provider>
                    </AuthorizeReqContext.Provider>
                  </ReferendaContext.Provider>
                </FetchingContext.Provider>
              </APIContext.Provider>
            </AccountContext.Provider>
          </SettingsContext.Provider>
        </ActionContext.Provider>
      }</Loading>
    </AnimatePresence>
  );
}
