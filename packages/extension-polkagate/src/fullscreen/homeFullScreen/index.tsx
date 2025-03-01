// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { AccountContext, ActionContext } from '../../components';
import { useAccountsOrder, useAlerts, useFullscreen, useProfileAccounts, useTranslation } from '../../hooks';
import { AddNewAccountButton } from '../../partials';
import FullScreenHeader from '../governance/FullScreenHeader';
import SupportUs from '../governance/SupportUs';
import HeaderComponents from './components/HeaderComponents';
import DraggableAccountsList from './partials/DraggableAccountList';
import HomeMenu from './partials/HomeMenu';
import ProfileTabsFullScreen from './partials/ProfileTabsFullScreen';
import TotalBalancePieChart, { type AssetsWithUiAndPrice } from './partials/TotalBalancePieChart';
import WatchList from './partials/WatchList';

function HomePageFullScreen(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();

  const onAction = useContext(ActionContext);
  const { notify } = useAlerts();
  const initialAccountList = useAccountsOrder(true);
  const { accounts: accountsInExtension } = useContext(AccountContext);

  const [groupedAssets, setGroupedAssets] = useState<AssetsWithUiAndPrice[] | undefined>();

  const profileAccounts = useProfileAccounts(initialAccountList);

  useEffect(() => {
    if (accountsInExtension && accountsInExtension?.length === 0) {
      notify(t('No accounts found!'), 'info');

      onAction('/onboarding');
    }
  }, [accountsInExtension, notify, onAction, t]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        _otherComponents={
          <HeaderComponents
          />
        }
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item sx={{ bgcolor: 'backgroundFL.secondary', maxWidth: '1282px' }}>
        <Grid container display='block' item sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', pb: '40px' }}>
          <ProfileTabsFullScreen
            orderedAccounts={initialAccountList}
          />
          <Grid container justifyContent='space-around'>
            <Grid container direction='column' item rowGap='20px' width='760px'>
              {profileAccounts &&
                <DraggableAccountsList
                  initialAccountList={profileAccounts}
                />
              }
              {profileAccounts && profileAccounts?.length <= 2 &&
                <AddNewAccountButton />
              }
            </Grid>
            <Grid container direction='column' item rowGap='20px' width='fit-content'>
              <Grid container item width='fit-content'>
                <TotalBalancePieChart
                  setGroupedAssets={setGroupedAssets}
                />
              </Grid>
              {groupedAssets && groupedAssets?.length > 0 &&
                <Grid container item width='fit-content'>
                  <WatchList
                    groupedAssets={groupedAssets}
                  />
                </Grid>
              }
              <Grid container item width='fit-content'>
                <HomeMenu />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <SupportUs />
    </Grid>
  );
}

export default React.memo(HomePageFullScreen);
