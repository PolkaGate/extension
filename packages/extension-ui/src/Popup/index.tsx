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

// import Governance from '../../../extension-polkagate/src/Popup/Governance';// added for plus
// import SocialRecovery from '../../../extension-polkagate/src/Popup/SocialRecovery';// added for plus
import { ErrorBoundary, Loading } from '../../../extension-polkagate/src/components';
import { AccountContext, ActionContext, APIContext, AuthorizeReqContext, FetchingContext, MediaContext, MetadataReqContext, SettingsContext, SigningReqContext } from '../../../extension-polkagate/src/components/contexts';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '../../../extension-polkagate/src/messaging';
import Account from '../../../extension-polkagate/src/popup/account';
import AuthList from '../../../extension-polkagate/src/popup/authManagement';
import Authorize from '../../../extension-polkagate/src/popup/authorize/index';
import CreateAccount from '../../../extension-polkagate/src/popup/createAccount';
import CrowdLoans from '../../../extension-polkagate/src/popup/crowdloans';
import Derive from '../../../extension-polkagate/src/popup/deriveAccount';
import Export from '../../../extension-polkagate/src/popup/export/Export';
import ExportAll from '../../../extension-polkagate/src/popup/export/ExportAll';
import ForgetAccount from '../../../extension-polkagate/src/popup/forgetAccount';
import History from '../../../extension-polkagate/src/popup/history';
import Accounts from '../../../extension-polkagate/src/popup/home';
import AddAddressOnly from '../../../extension-polkagate/src/popup/import/addAddressOnly';
import AttachQR from '../../../extension-polkagate/src/popup/import/attachQR';
import ImportLedger from '../../../extension-polkagate/src/popup/import/importLedger';
import ImportSeed from '../../../extension-polkagate/src/popup/import/importSeed';
import RestoreJson from '../../../extension-polkagate/src/popup/import/restoreJSON';
import ManageProxies from '../../../extension-polkagate/src/popup/manageProxies';
import Metadata from '../../../extension-polkagate/src/popup/metadata';
import PhishingDetected from '../../../extension-polkagate/src/popup/PhishingDetected';
import Receive from '../../../extension-polkagate/src/popup/receive';
import Rename from '../../../extension-polkagate/src/popup/rename';
import Send from '../../../extension-polkagate/src/popup/send';
import Review from '../../../extension-polkagate/src/popup/send/Review';
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
import SoloStake from '../../../extension-polkagate/src/popup/staking/solo/stake';
import TuneUp from '../../../extension-polkagate/src/popup/staking/solo/tuneUp';
import SoloUnstake from '../../../extension-polkagate/src/popup/staking/solo/unstake';
import Welcome from '../../../extension-polkagate/src/popup/welcome';
import { buildHierarchy } from '../../../extension-polkagate/src/util/buildHierarchy';
import { MILLISECONDS_TO_UPDATE } from '../../../extension-polkagate/src/util/constants';
import { APIs, Fetching } from '../../../extension-polkagate/src/util/types';

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
  const [isWelcomeDone, setWelcomeDone] = useState(false);
  const [settingsCtx, setSettingsCtx] = useState<SettingsStruct>(startSettings);
  const [apis, setApis] = useState<APIs>({});
  const [fetching, setFetching] = useState<Fetching>({});

  /** To save current page url */
  if (window.location.hash !== '#/') {
    window.localStorage.setItem('last_url', JSON.stringify({ time: Date.now(), url: window.location.hash }));
  }

  /** To LOAD last saved page url */
  useEffect(() => {
    const lastUrlInfo = window.localStorage.getItem('last_url');

    if (lastUrlInfo) {
      const info = JSON.parse(lastUrlInfo) as { time: number, url: string };

      if (Date.now() - info.time < MILLISECONDS_TO_UPDATE) {
        /** TODO: this url replacement is disabled until finding a way to handle Authorize and transactions popups/pages */
        // window.location.hash = info.url;
      }
    }
  }, []);

  const set = useCallback((change: Fetching) => {
    setFetching(change);
  }, []);

  const setIt = useCallback((change: APIs) => {
    setApis(change);
  }, []);

  const _onAction = useCallback(
    (to?: string): void => {
      setWelcomeDone(window.localStorage.getItem('welcome_read') === 'ok');

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

  const Root = isWelcomeDone
    ? authRequests && authRequests.length
      ? wrapWithErrorBoundary(<Authorize />, 'authorize')
      : metaRequests && metaRequests.length
        ? wrapWithErrorBoundary(<Metadata />, 'metadata')
        : signRequests && signRequests.length
          ? wrapWithErrorBoundary(<Signing />, 'signing')
          : wrapWithErrorBoundary(<Accounts />, 'accounts')
    : wrapWithErrorBoundary(<Welcome />, 'welcome');

  return (
    <AnimatePresence exitBeforeEnter>
      <Loading>{accounts && authRequests && metaRequests && signRequests &&
        <ActionContext.Provider value={_onAction}>
          <SettingsContext.Provider value={settingsCtx}>
            <AccountContext.Provider value={accountCtx}>
              <APIContext.Provider value={{ apis, setIt }}>
                <FetchingContext.Provider value={{ fetching, set }}>
                  <AuthorizeReqContext.Provider value={authRequests}>
                    <MediaContext.Provider value={cameraOn && mediaAllowed}>
                      <MetadataReqContext.Provider value={metaRequests}>
                        <SigningReqContext.Provider value={signRequests}>
                          <Switch>
                            <Route path='/crowdloans/:address'>{wrapWithErrorBoundary(<CrowdLoans />, 'crowdloans')}</Route>
                            <Route path='/rename/:address'>{wrapWithErrorBoundary(<Rename />, 'rename')}</Route>
                            <Route path='/manageProxies/:address'>{wrapWithErrorBoundary(<ManageProxies />, 'manageProxies')}</Route>
                            <Route path='/history/:address'>{wrapWithErrorBoundary(<History />, 'history')}</Route>
                            <Route path='/receive/:address'>{wrapWithErrorBoundary(<Receive />, 'receive')}</Route>
                            {/* <Route path='/governance/:genesisHash/:address'>{wrapWithErrorBoundary(<Governance />, 'governance')}</Route> */}
                            {/* <Route path='/socialRecovery/:genesisHash/:address'>{wrapWithErrorBoundary(<SocialRecovery />, 'social-recovery')}</Route> */}
                            <Route path='/pool/myPool/:address'>{wrapWithErrorBoundary(<PoolInformation />, 'pool-poolInfromation')}</Route>
                            <Route path='/pool/stake/:address'>{wrapWithErrorBoundary(<PoolStake />, 'pool-stake')}</Route>
                            <Route path='/solo/stake/:address'>{wrapWithErrorBoundary(<SoloStake />, 'solo-stake')}</Route>
                            <Route path='/pool/unstake/:address'>{wrapWithErrorBoundary(<PoolUnstake />, 'pool-unstake')}</Route>
                            <Route path='/solo/unstake/:address'>{wrapWithErrorBoundary(<SoloUnstake />, 'solo-unstake')}</Route>
                            <Route path='/solo/fastUnstake/:address'>{wrapWithErrorBoundary(<FastUnstake />, 'solo-fast-unstake')}</Route>
                            <Route path='/solo/restake/:address'>{wrapWithErrorBoundary(<SoloRestake />, 'solo-restake')}</Route>
                            <Route path='/pool/join/:address'>{wrapWithErrorBoundary(<JoinPool />, 'pool-join')}</Route>
                            <Route path='/pool/create/:address'>{wrapWithErrorBoundary(<CreatePool />, 'pool-create')}</Route>
                            <Route path='/pool/nominations/:address'>{wrapWithErrorBoundary(<PoolNominations />, 'pool-nominations')}</Route>
                            <Route path='/solo/nominations/:address'>{wrapWithErrorBoundary(<SoloNominations />, 'solo-nominations')}</Route>
                            <Route path='/pool/:address'>{wrapWithErrorBoundary(<Pool />, 'pool-staking')}</Route>
                            <Route path='/solo/:address'>{wrapWithErrorBoundary(<Solo />, 'solo-staking')}</Route>
                            <Route path='/tuneup/:address'>{wrapWithErrorBoundary(<TuneUp />, 'tuneup')}</Route>
                            <Route exact path='/account/:genesisHash/:address/'>{wrapWithErrorBoundary(<Account />, 'account')}</Route>
                            <Route exact path='/send/:address/'>{wrapWithErrorBoundary(<Send />, 'send')}</Route>
                            <Route exact path='/send/review/:genesisHash/:address/:formatted'>{wrapWithErrorBoundary(<Review />, 'review')}</Route>
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
                </FetchingContext.Provider>
              </APIContext.Provider>
            </AccountContext.Provider>
          </SettingsContext.Provider>
        </ActionContext.Provider>
      }</Loading>
    </AnimatePresence>
  );
}
