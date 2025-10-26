// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import semver from 'semver';

import useIsForgotten from '@polkadot/extension-polkagate/src/hooks/useIsForgotten';

import { AccountContext, FadeOnScroll, Motion } from '../../components';
import { useBackground, useManifest, useMerkleScience } from '../../hooks';
import { UserDashboardHeader, WhatsNew } from '../../partials';
import HomeMenu from '../../partials/HomeMenu';
import Reset from '../passwordManagement/Reset';
import Welcome from '../welcome';
import AssetsBox from './partial/AssetsBox';
import Portfolio from './partial/Portfolio';
import ChangeLog from './ChangeLog';

export default function Home (): React.ReactElement {
  useBackground('default') as void;

  const manifest = useManifest();
  const { hierarchy } = useContext(AccountContext);
  const refContainer = useRef<HTMLDivElement>(null);

  useMerkleScience(undefined, undefined, true); // to download the data file

  const [show, setShowAlert] = useState<boolean>(false);
  const isForgotten = useIsForgotten();

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

  return (
    <Motion>
      {show &&
        <ChangeLog
          newVersion
          openMenu={show}
          setShowAlert={setShowAlert}
        />
      }
      {hierarchy.length === 0
        ? isForgotten?.status
          ? <Reset />
          : <Welcome />
        : <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
          <UserDashboardHeader />
          <Portfolio />
          <Grid container item ref={refContainer} sx={{ maxHeight: '420px', overflowY: 'auto' }}>
            <AssetsBox />
            <WhatsNew style={{ columnGap: '5px', paddingBottom: '75px', paddingTop: '24px' }} />
            <FadeOnScroll containerRef={refContainer} />
          </Grid>
          <HomeMenu />
        </Grid>
      }
    </Motion>
  );
}
