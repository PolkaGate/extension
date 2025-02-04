// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { Pages } from './type';

import { Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import semver from 'semver';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext } from '../../components';
import { getStorage, type LoginInfo } from '../../components/Loading';
import { useManifest, useMerkleScience } from '../../hooks';
import { UserDashboardHeader, Version2 as Version } from '../../partials';
import HomeMenu from '../../partials/HomeMenu';
import Reset from '../passwordManagement/Reset';
import Welcome from '../welcome';
import AssetsBox from './partial/AssetsBox';
import Portfolio from './partial/Portfolio';
import WhatsNew from './WhatsNew';

function AccountPortfolio (): React.ReactElement {
  return (
    <>
      <Portfolio />
      <Grid container item sx={{ maxHeight: '342px', overflow: 'scroll' }}>
        <AssetsBox />
        <Version />
      </Grid>
    </>
  );
}

export default function Home (): React.ReactElement {
  const manifest = useManifest();
  const { hierarchy } = useContext(AccountContext);

  useMerkleScience(undefined, undefined, true); // to download the data file

  const [show, setShowAlert] = useState<boolean>(false);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [page, setPage] = useState<Pages>('home');

  useEffect(() => {
    if (!manifest?.version) {
      return;
    }

    try {
      const usingVersion = window.localStorage.getItem('using_version');

      if (!usingVersion) {
        window.localStorage.setItem('using_version', manifest.version);
        setShowAlert(true);
      } else if (semver.lt(usingVersion, manifest.version)) {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error while checking version:', error);
    }
  }, [manifest?.version]);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);

    getStorage('loginInfo').then((info) => setLoginInfo(info as LoginInfo)).catch(console.error);
  }, []);

  return (
    <>
      <WhatsNew
        setShowAlert={setShowAlert}
        show={show}
      />
      {hierarchy.length === 0
        ? loginInfo?.status === 'forgot'
          ? <Reset />
          : <Welcome />
        : <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
          <UserDashboardHeader />
          <AccountPortfolio />
          <HomeMenu />
        </Grid>
      }
    </>
  );
}
