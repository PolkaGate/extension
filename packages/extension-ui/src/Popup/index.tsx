// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import { canDerive } from '@polkadot/extension-base/utils';
import uiSettings from '@polkadot/ui-settings';

// import CrowdLoans from '../../../extension-polkagate/src/Popup/CrowdLoans';// added for plus
// import Governance from '../../../extension-polkagate/src/Popup/Governance';// added for plus
// import SocialRecovery from '../../../extension-polkagate/src/Popup/SocialRecovery';// added for plus
import { Loading } from '../../../extension-polkagate/src/components';
import { AccountContext, ActionContext, AuthorizeReqContext, MediaContext, MetadataReqContext, SettingsContext, SigningReqContext } from '../../../extension-polkagate/src/components/contexts';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '../../../extension-polkagate/src/messaging';
import SelectProxy from '../../../extension-polkagate/src/partials/SelectProxy';
import Account from '../../../extension-polkagate/src/popup/account';
import Others from '../../../extension-polkagate/src/popup/account/Others';
import AuthList from '../../../extension-polkagate/src/popup/authManagement';
import Authorize from '../../../extension-polkagate/src/popup/authorize/index';
import CreateAccount from '../../../extension-polkagate/src/popup/createAccount';
import Derive from '../../../extension-polkagate/src/popup/deriveAccount';
import Export from '../../../extension-polkagate/src/popup/export/Export';
import ExportAll from '../../../extension-polkagate/src/popup/export/ExportAll';
import ForgetAccount from '../../../extension-polkagate/src/popup/ForgetAccount';
import Detail from '../../../extension-polkagate/src/popup/history/Detail';
import History from '../../../extension-polkagate/src/popup/history/Index';
import Accounts from '../../../extension-polkagate/src/popup/home';
import AddProxy from '../../../extension-polkagate/src/popup/import/addProxied';
import AttachQR from '../../../extension-polkagate/src/popup/import/attachQR';
import ImportLedger from '../../../extension-polkagate/src/popup/import/importLedger';
import ImportSeed from '../../../extension-polkagate/src/popup/import/importSeed';
import RestoreJson from '../../../extension-polkagate/src/popup/import/restoreJSON';
import ManageProxies from '../../../extension-polkagate/src/popup/manageProxies';
import Receive from '../../../extension-polkagate/src/popup/receive/Receive';
import Rename from '../../../extension-polkagate/src/popup/rename';
import Send from '../../../extension-polkagate/src/popup/send';
import Review from '../../../extension-polkagate/src/popup/send/Review';
import Staking from '../../../extension-polkagate/src/popup/stake';
import Pool from '../../../extension-polkagate/src/popup/stake/pool';
import PoolUnstake from '../../../extension-polkagate/src/popup/stake/pool/unstake';
import Welcome from '../../../extension-polkagate/src/popup/welcome';
import { buildHierarchy } from '../../../extension-polkagate/src/util/buildHierarchy';
import { ErrorBoundary } from '../components';
import ToastProvider from '../components/Toast/ToastProvider';
import Metadata from './Metadata';
import PhishingDetected from './PhishingDetected';
import Signing from './Signing';
import JoinPool from '../../../extension-polkagate/src/popup/stake/pool/joinPool/JoinPool';
import PoolStake from '../../../extension-polkagate/src/popup/stake/pool/Stake';
import CreatePool from '../../../extension-polkagate/src/popup/stake/pool/createPool/CreatePool';
import BondExtra from '../../../extension-polkagate/src/popup/stake/pool/bondExtra/BondExtra';

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
    // <ColorContext.Provider value={colorMode}>
    <AnimatePresence exitBeforeEnter>
      <Loading>{accounts && authRequests && metaRequests && signRequests && (
        <ActionContext.Provider value={_onAction}>
          <SettingsContext.Provider value={settingsCtx}>
            <AccountContext.Provider value={accountCtx}>
              <AuthorizeReqContext.Provider value={authRequests}>
                <MediaContext.Provider value={cameraOn && mediaAllowed}>
                  <MetadataReqContext.Provider value={metaRequests}>
                    <SigningReqContext.Provider value={signRequests}>
                      <ToastProvider>
                        <Switch>
                          {/* <Route path='/crowdloans/:genesisHash/:address'>{wrapWithErrorBoundary(<CrowdLoans />, 'crowdloans')}</Route> */}
                          <Route path='/rename/:address'>{wrapWithErrorBoundary(<Rename />, 'rename')}</Route>
                          <Route path='/manageProxies/:address'>{wrapWithErrorBoundary(<ManageProxies />, 'manageProxies')}</Route>
                          <Route path='/selectProxy/:proxiedAddress/:genesisHash'>{wrapWithErrorBoundary(<SelectProxy />, 'select-proxy')}</Route>
                          <Route path='/history/:chainName/:decimal/:token/:formatted'>{wrapWithErrorBoundary(<History />, 'history')}</Route>
                          <Route path='/detail/:hash'>{wrapWithErrorBoundary(<Detail />, 'history-detail')}</Route>
                          <Route path='/receive/:address'>{wrapWithErrorBoundary(<Receive />, 'receive')}</Route>
                          {/* <Route path='/governance/:genesisHash/:address'>{wrapWithErrorBoundary(<Governance />, 'governance')}</Route> */}
                          {/* <Route path='/socialRecovery/:genesisHash/:address'>{wrapWithErrorBoundary(<SocialRecovery />, 'social-recovery')}</Route> */}
                          <Route path='/staking/:address'>{wrapWithErrorBoundary(<Staking />, 'staking')}</Route>
                          <Route path='/pool/stake/:address'>{wrapWithErrorBoundary(<PoolStake />, 'pool-stake')}</Route>
                          <Route path='/pool/bondExtra/:address'>{wrapWithErrorBoundary(<BondExtra />, 'pool-bondExtra')}</Route>
                          <Route path='/pool/unstake/:address'>{wrapWithErrorBoundary(<PoolUnstake />, 'pool-unstaking')}</Route>
                          <Route path='/pool/join/:address'>{wrapWithErrorBoundary(<JoinPool />, 'pool-join')}</Route>
                          <Route path='/pool/create/:address'>{wrapWithErrorBoundary(<CreatePool />, 'pool-create')}</Route>
                          <Route path='/pool/:address'>{wrapWithErrorBoundary(<Pool />, 'pool-staking')}</Route>
                          <Route exact path='/account/:genesisHash/:address/'>{wrapWithErrorBoundary(<Account />, 'account')}</Route>
                          <Route exact path='/send/:genesisHash/:address/:formatted'>{wrapWithErrorBoundary(<Send />, 'send')}</Route>
                          <Route exact path='/send/review/:genesisHash/:address/:formatted'>{wrapWithErrorBoundary(<Review />, 'review')}</Route>
                          <Route path='/auth-list'>{wrapWithErrorBoundary(<AuthList />, 'auth-list')}</Route>
                          <Route path='/account/proxy'>{wrapWithErrorBoundary(<AddProxy />, 'add-proxy')}</Route>
                          <Route path='/account/create'>{wrapWithErrorBoundary(<CreateAccount />, 'account-creation')}</Route>
                          <Route exact path='/forget/:address/:isExternal'>{wrapWithErrorBoundary(<ForgetAccount />, 'forget-address')}</Route>
                          <Route exact path='/export/:address'>{wrapWithErrorBoundary(<Export />, 'export-address')}</Route>
                          <Route path='/account/export-all'>{wrapWithErrorBoundary(<ExportAll />, 'export-all-address')}</Route>
                          <Route path='/account/import-ledger'>{wrapWithErrorBoundary(<ImportLedger />, 'import-ledger')}</Route>
                          <Route path='/account/attach-qr'>{wrapWithErrorBoundary(<AttachQR />, 'attach-qr')}</Route>
                          <Route path='/account/import-seed'>{wrapWithErrorBoundary(<ImportSeed />, 'import-seed')}</Route>
                          <Route path='/account/restore-json'>{wrapWithErrorBoundary(<RestoreJson />, 'restore-json')}</Route>
                          <Route path='/derive/:address/locked'>{wrapWithErrorBoundary(<Derive isLocked />, 'derived-address-locked')}</Route>
                          <Route path='/derive/:address'>{wrapWithErrorBoundary(<Derive />, 'derive-address')}</Route>
                          <Route exact path='/others/:address'>{wrapWithErrorBoundary(<Others />, 'others')}</Route>
                          <Route path={`${PHISHING_PAGE_REDIRECT}/:website`}>{wrapWithErrorBoundary(<PhishingDetected />, 'phishing-page-redirect')}</Route>
                          <Route
                            exact
                            path='/'
                          >
                            {Root}
                          </Route>
                        </Switch>
                      </ToastProvider>
                    </SigningReqContext.Provider>
                  </MetadataReqContext.Provider>
                </MediaContext.Provider>
              </AuthorizeReqContext.Provider>
            </AccountContext.Provider>
          </SettingsContext.Provider>
        </ActionContext.Provider>
      )}</Loading>
    </AnimatePresence>
    // </ColorContext.Provider>
  );
}
