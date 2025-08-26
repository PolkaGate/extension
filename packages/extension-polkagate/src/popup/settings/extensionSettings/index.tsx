// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { BackWithLabel, Motion } from '../../../components';
import { useIsDark, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import Chains from './Chains';
import Main from './Main';
import ManagePassword from './ManagePassword';
import TopMenus from './TopMenus';

function ExtensionSettings (): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDark = useIsDark();
  const navigate = useNavigate();

  const fullscreenURL = useMemo(() => pathname === '/settings-extension/chains' ? '/settingsfs/network' : '/settingsfs/', [pathname]);

  const onBack = useCallback(() => navigate('/settings') as void, [navigate]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader fullscreenURL={fullscreenURL} homeType='default' />
      <BackWithLabel
        onClick={onBack}
        text={t('Extension Settings')}
      />
      <Grid container item sx={{ px: '15px' }}>
        <TopMenus />
        <Motion variant='slide'>
          <Grid container item sx={{ bgcolor: isDark ? '#1B133C' : '#F5F4FF', borderRadius: '14px', my: '15px', p: '4px' }}>
            <Grid container item sx={{ bgcolor: 'background.paper', borderRadius: '14px', height: '373px', overflowY: 'auto' }}>
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
          </Grid>
        </Motion>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(ExtensionSettings);
