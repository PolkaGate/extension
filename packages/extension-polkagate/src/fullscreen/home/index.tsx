// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useExtensionLockContext } from '@polkadot/extension-polkagate/src/context/ExtensionLockContext';
import { getStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext } from '../../components';
import { useAlerts, useTranslation } from '../../hooks';
import HomeLayout from '../components/layout';
import ProxiedAccount from '../settings/importProxied/ProxiedAccount';
import AccountList from './AccountList';
import AccountsAdd from './AccountsAdd';
import AssetsBars from './assetBars';
import PortfolioFullScreen from './PortfolioFullScreen';
import TrendingAssets from './trendingAssets';

function HomePageFullScreen(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { notify } = useAlerts();
  const { accounts } = useContext(AccountContext);
  const { isExtensionLocked } = useExtensionLockContext();

  useEffect(() => {
    if (isExtensionLocked === false && accounts?.length === 0) {
      notify(t('No accounts found!'), 'info');

      navigate('/onboarding') as void;

      return;
    }

    getStorage(STORAGE_KEY.SUBSCAN_API_KEY).then((key) => {
      if (!key) {
        notify(t('A Subscan API key is required. Please add it in settings.'), 'info');
      }
    }).catch(console.error);
  }, [accounts, notify, navigate, t, isExtensionLocked]);

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
      <ProxiedAccount />
    </HomeLayout>
  );
}

export default React.memo(HomePageFullScreen);
