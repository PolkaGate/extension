// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import semver from 'semver';

import useIsForgotten from '@polkadot/extension-polkagate/src/hooks/useIsForgotten';

import { AccountContext, FadeOnScroll, Motion } from '../../components';
import { useBackground, useIsSidePanel, useManifest } from '../../hooks';
import { UserDashboardHeader, WhatsNew } from '../../partials';
import HomeMenu from '../../partials/HomeMenu';
import Reset from '../passwordManagement/Reset';
import Welcome from '../welcome';
import AssetsBox from './partial/AssetsBox';
import Portfolio from './partial/Portfolio';
import ChangeLog from './ChangeLog';

export default function Home(): React.ReactElement {
  useBackground('default') as void;

  const theme = useTheme();
  const fadeBackgroundColor = theme.palette.background.default;
  const manifest = useManifest();
  const { hierarchy } = useContext(AccountContext);
  const refContainer = useRef<HTMLDivElement>(null);
  const isSidePanel = useIsSidePanel();

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
        : <Grid alignContent='flex-start' container sx={{ flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, height: isSidePanel ? '100vh' : undefined, overflow: isSidePanel ? 'hidden' : undefined, pb: isSidePanel ? '86px' : undefined, position: 'relative' }}>
          <UserDashboardHeader />
          <Portfolio />
          <Grid container item ref={refContainer} sx={{ display: isSidePanel ? 'flex' : undefined, flex: isSidePanel ? '1 1 auto' : undefined, flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, maxHeight: isSidePanel ? 'none' : '420px', minHeight: isSidePanel ? 0 : undefined, overflowY: isSidePanel ? 'hidden' : 'auto' }}>
            <AssetsBox />
            {!isSidePanel &&
              <>
                <WhatsNew style={{ columnGap: '5px', paddingBottom: '75px', paddingTop: '24px' }} />
                <FadeOnScroll
                  backgroundColor={fadeBackgroundColor}
                  containerRef={refContainer}
                  height='96px'
                  style={{
                    WebkitBackdropFilter: 'none',
                    backdropFilter: 'none',
                    background: `linear-gradient(0deg, ${fadeBackgroundColor} 0%, ${fadeBackgroundColor}F2 68%, ${fadeBackgroundColor}80 88%, ${fadeBackgroundColor}00 100%)`
                  }}
                />
              </>
            }
          </Grid>
          {isSidePanel &&
            <WhatsNew style={{ columnGap: '5px', paddingBottom: '12px', paddingTop: '18px' }} />
          }
          <HomeMenu />
        </Grid>
      }
    </Motion>
  );
}
