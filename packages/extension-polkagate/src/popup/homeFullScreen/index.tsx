// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { closestCorners, DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { AccountContext } from '../../components';
import { useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';
import AccountItem from './partials/AccountItem';
import DraggableAccountsList from './partials/DraggableAccountList';
import HomeMenu from './partials/HomeMenu';
import TotalBalancePieChart from './partials/TotalBalancePieChart';

export interface AccountsOrder {
  id: number,
  account: AccountWithChildren
}

export default function HomePageFullScreen(): React.ReactElement {
  useFullscreen();
  const theme = useTheme();
  const { hierarchy } = useContext(AccountContext);

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [accountsOrder, setAccountsOrder] = useState<AccountsOrder[]>();

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  const init = useMemo(() => {
    return hierarchy.map((_account, index) => ({
      account: _account,
      id: index + 1
    }));
  }, [hierarchy]);

  // const sortedAccount = useMemo(() =>
  //   hierarchy.sort((a, b) => {
  //     const x = a.name.toLowerCase();
  //     const y = b.name.toLowerCase();

  //     if (x < y) {
  //       return -1;
  //     }

  //     if (x > y) {
  //       return 1;
  //     }

  //     return 0;
  //   }), [hierarchy]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
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
      <Grid container item justifyContent='space-around' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', py: '40px' }}>
        <Grid container direction='column' item rowGap='20px' width='fit-content'>
          <DraggableAccountsList
            hideNumbers={hideNumbers}
            initialAccountList={init}
          />
        </Grid>
        <Grid container direction='column' item rowGap='20px' width='fit-content'>
          <Grid container item width='fit-content'>
            <TotalBalancePieChart
              hideNumbers={hideNumbers}
            />
          </Grid>
          <Grid container item width='fit-content'>
            <HomeMenu />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
