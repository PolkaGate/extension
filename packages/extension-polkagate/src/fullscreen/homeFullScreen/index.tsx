// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { AccountContext, ActionContext } from '../../components';
import { useAccountsOrder, useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';
import DraggableAccountsList from './partials/DraggableAccountList';
import HomeMenu from './partials/HomeMenu';
import TotalBalancePieChart from './partials/TotalBalancePieChart';
import WatchList, { AssetsWithUiAndPrice } from './partials/WatchList';

export interface AccountsOrder {
  id: number,
  account: AccountWithChildren
}

export default function HomePageFullScreen (): React.ReactElement {
  useFullscreen();
  const initialAccountList = useAccountsOrder(true) as AccountsOrder[];
  const onAction = useContext(ActionContext);
  const { accounts: accountsInExtension } = useContext(AccountContext);

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [groupedAssets, setGroupedAssets] = useState<AssetsWithUiAndPrice[] | undefined>();

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
      <Grid container item justifyContent='space-around' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', py: '40px' }}>
        <Grid container direction='column' item rowGap='20px' width='760px'>
          {initialAccountList &&
            <DraggableAccountsList
              hideNumbers={hideNumbers}
              initialAccountList={initialAccountList}
            />
          }
        </Grid>
        <Grid container direction='column' item rowGap='20px' width='fit-content'>
          <Grid container item width='fit-content'>
            <TotalBalancePieChart
              hideNumbers={hideNumbers}
              setGroupedAssets={setGroupedAssets}
            />
          </Grid>
          <Grid container item width='fit-content'>
            {groupedAssets &&
             <WatchList
               groupedAssets={groupedAssets}
             />
            }
          </Grid>
          <Grid container item width='fit-content'>
            <HomeMenu />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
