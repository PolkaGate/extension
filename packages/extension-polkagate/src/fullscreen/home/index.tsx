// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountContext } from '../../components';
import { useAlerts, useFullscreen, useTranslation } from '../../hooks';
import HomeLayout from '../components/layout';
import AccountList from './AccountList';
import AccountsAdd from './AccountsAdd';
import AssetsBars from './AssetsBars';
import PortfolioFullScreen from './PortfolioFullScreen';
import TrendingAssets from './TrendingAssets';

function HomePageFullScreen (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { notify } = useAlerts();
  const { accounts: accountsInExtension } = useContext(AccountContext);

  useEffect(() => {
    if (accountsInExtension && accountsInExtension?.length === 0) {
      notify(t('No accounts found!'), 'info');

      navigate('/onboarding') as void;
    }
  }, [accountsInExtension, notify, navigate, t]);

  return (
    <HomeLayout>
      {/* left column */}
      <Stack direction='column' sx={{ height: 'inherit', mx: '8px', width: ' 506px' }}>
        <PortfolioFullScreen />
        <AssetsBars />
        <TrendingAssets />
      </Stack>
      {/* Right column */}
      <Stack direction='column' sx={{ height: 'inherit', ml: '20px', mx: '8px', position: 'relative', width: ' 541px' }}>
        <AccountsAdd />
        <AccountList />
      </Stack>
    </HomeLayout>
  );
}

export default React.memo(HomePageFullScreen);
