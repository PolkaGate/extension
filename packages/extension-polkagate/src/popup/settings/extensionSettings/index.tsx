// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React, { useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BackWithLabel, FadeOnScroll, Motion } from '../../../components';
import { useIsDark, useIsSidePanel, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import Chains from './Chains';
import Main from './Main';
import ManagePassword from './ManagePassword';
import TopMenus from './TopMenus';

interface ExtensionSettingsState {
  from?: string;
}

function ExtensionSettings(): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDark = useIsDark();
  const isSidePanel = useIsSidePanel();
  const navigate = useNavigate();
  const location = useLocation() as unknown as Location & { state?: ExtensionSettingsState };
  const settingsContainerRef = useRef<HTMLDivElement>(null);

  const fullscreenURL = useMemo(() => pathname === '/settings-extension/chains' ? '/settingsfs/network' : '/settingsfs/', [pathname]);

  const onBack = useCallback(() => navigate(location.state?.from ?? '/settings') as void, [location.state?.from, navigate]);

  return (
    <Container disableGutters sx={{ display: isSidePanel ? 'flex' : undefined, flexDirection: isSidePanel ? 'column' : undefined, height: isSidePanel ? '100vh' : undefined, overflow: isSidePanel ? 'hidden' : undefined, pb: isSidePanel ? '86px' : undefined, position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={fullscreenURL} homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Extension Settings')}
      />
      <Grid container item sx={{ alignContent: isSidePanel ? 'flex-start' : undefined, flex: isSidePanel ? '1 1 auto' : undefined, flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, justifyContent: isSidePanel ? 'flex-start' : undefined, minHeight: isSidePanel ? 0 : undefined, px: '15px' }}>
        <TopMenus />
        <Motion style={isSidePanel ? { display: 'flex', flex: '1 1 auto', flexDirection: 'column', minHeight: 0, overflow: 'hidden' } : undefined} variant='slide'>
          <Grid container item sx={{ bgcolor: isDark ? '#1B133C' : '#F5F4FF', borderRadius: '14px', flex: isSidePanel ? '1 1 auto' : undefined, flexDirection: isSidePanel ? 'column' : undefined, minHeight: isSidePanel ? 0 : undefined, my: '15px', overflow: isSidePanel ? 'hidden' : undefined, p: '4px', position: 'relative' }}>
            <Grid container item ref={settingsContainerRef} sx={{ bgcolor: 'background.paper', borderRadius: '14px', display: isSidePanel ? 'block' : undefined, flex: isSidePanel ? '1 1 auto' : undefined, height: isSidePanel ? undefined : '373px', minHeight: isSidePanel ? 0 : undefined, overflowY: 'auto', pb: isSidePanel ? '48px' : undefined }}>
              {
                pathname === '/settings-extension/' &&
                <Main />
              }
              {
                pathname === '/settings-extension/chains' &&
                <Chains />
              }
              {
                pathname === '/settings-extension/password' &&
                <ManagePassword />
              }
            </Grid>
            <FadeOnScroll
              backgroundColor={isDark ? '#110F2A' : '#FFFFFF'}
              containerRef={settingsContainerRef}
              height='32px'
              ratio={0.55}
              style={{
                background: isDark
                  ? 'linear-gradient(0deg, #110F2A 0%, rgba(17, 15, 42, 0.42) 48%, rgba(17, 15, 42, 0) 100%)'
                  : 'linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0.45) 48%, rgba(255, 255, 255, 0) 100%)',
                borderRadius: '0 0 14px 14px',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 2
              }}
            />
          </Grid>
        </Motion>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(ExtensionSettings);
