// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { AccountContext, ActionContext } from '../../components';
import { useAccountsOrder, useFullscreen, useProfileAccounts } from '../../hooks';
import { AddNewAccountButton } from '../../partials';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';
import DraggableAccountsList from './partials/DraggableAccountList';
import HomeMenu from './partials/HomeMenu';
import ProfileTabs from './partials/ProfileTabs';
import TotalBalancePieChart, { type AssetsWithUiAndPrice } from './partials/TotalBalancePieChart';
import WatchList from './partials/WatchList';

export default function HomePageFullScreen(): React.ReactElement {
  useFullscreen();
  const initialAccountList = useAccountsOrder(true) as AccountsOrder[] | undefined;
  const onAction = useContext(ActionContext);
  const { accounts: accountsInExtension } = useContext(AccountContext);

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [groupedAssets, setGroupedAssets] = useState<AssetsWithUiAndPrice[] | undefined>();

  const profileAccounts = useProfileAccounts(initialAccountList) as AccountsOrder[] | undefined;

  useEffect(() => {
    if (accountsInExtension && accountsInExtension?.length === 0) {
      onAction('/onboarding');
    }
  }, [accountsInExtension, onAction]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        _otherComponents={
          <HeaderComponents
            hideNumbers={hideNumbers}
            setHideNumbers={setHideNumbers}
          />
        }
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item sx={{ bgcolor: 'backgroundFL.secondary', maxWidth: '1282px' }}>
        <Grid container item display='block' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', pb: '40px' }}>
          <ProfileTabs
            orderedAccounts={initialAccountList}
          />
          <Grid container justifyContent='space-around'>
            <Grid container direction='column' item rowGap='20px' width='760px'>
              {profileAccounts &&
                <DraggableAccountsList
                  hideNumbers={hideNumbers}
                  initialAccountList={profileAccounts}
                />
              }
              {initialAccountList && initialAccountList?.length <= 2 &&
                <AddNewAccountButton />
              }
            </Grid>
            <Grid container direction='column' item rowGap='20px' width='fit-content'>
              <Grid container item width='fit-content'>
                <TotalBalancePieChart
                  hideNumbers={hideNumbers}
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
    </Grid>
  );
}
