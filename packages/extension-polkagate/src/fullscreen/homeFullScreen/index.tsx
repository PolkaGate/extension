// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { AccountContext, ActionContext } from '../../components';
import { useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';
import DraggableAccountsList, { saveNewOrder } from './partials/DraggableAccountList';
import HomeMenu from './partials/HomeMenu';
import TotalBalancePieChart from './partials/TotalBalancePieChart';
import WatchList, { AssetsWithUiAndPrice } from './partials/WatchList';

export interface AccountsOrder {
  id: number,
  account: AccountWithChildren
}

export default function HomePageFullScreen (): React.ReactElement {
  useFullscreen();
  const onAction = useContext(ActionContext);

  const { accounts: accountsInExtension, hierarchy } = useContext(AccountContext);

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [initialAccountList, setInitialAccountList] = useState<AccountsOrder[] | undefined>();
  const [groupedAssets, setGroupedAssets] = useState<AssetsWithUiAndPrice[] | undefined>();

  const flattenHierarchy = useCallback((account: AccountWithChildren): AccountWithChildren[] => {
    const flattenedChildren = (account.children || []).flatMap(flattenHierarchy);

    return [account, ...flattenedChildren];
  }, []);

  useEffect(() => {
    if (accountsInExtension && accountsInExtension?.length === 0) {
      onAction('/onboarding');
    }
  }, [accountsInExtension, onAction]);

  useEffect(() => {
    chrome.storage.local.get('addressOrder').then(({ addressOrder }: { addressOrder?: string[] }) => {
      if (addressOrder && addressOrder.length > 0) {
        const accountsOrder: AccountsOrder[] = [];
        let idCounter = 0;

        addressOrder.forEach((_address) => {
          const account = accountsInExtension.find(({ address }) => _address === address);

          if (account) {
            idCounter++;
            accountsOrder.push({
              account,
              id: idCounter
            });
          }
        });

        // Detects newly added accounts that may not be present in the storage.
        const untrackedAccounts = accountsInExtension.filter(({ address }) => !accountsOrder.map(({ account }) => account.address).includes(address));

        if (untrackedAccounts.length > 0) {
          const newAccounts = untrackedAccounts.filter(({ parentAddress }) => !parentAddress);
          const derivedAccounts = untrackedAccounts.filter(({ parentAddress }) => parentAddress);

          derivedAccounts.forEach((derivedAccount) => {
            const parentIndex = accountsOrder.findIndex(({ account }) => account.address === derivedAccount.parentAddress);
            const derivedAccountWithId = {
              account: derivedAccount,
              id: parentIndex + 1
            };

            accountsOrder.splice(parentIndex + 1, 0, derivedAccountWithId);

            accountsOrder.forEach((account, index) => {
              if (index <= parentIndex) {
                return;
              }

              account.id += 1;
            });
          });

          newAccounts.forEach((account) => {
            idCounter++;
            accountsOrder.push({
              account,
              id: idCounter
            });
          });
        }

        saveNewOrder(accountsOrder);
        setInitialAccountList(accountsOrder);
      } else {
        const accounts = hierarchy.flatMap((account) => flattenHierarchy(account));

        const accountsOrder = accounts.map((_account, index) => (
          {
            account: _account,
            id: index + 1
          }
        ));

        saveNewOrder(accountsOrder);
        setInitialAccountList(accountsOrder);
      }
    }).catch(console.error);
  }, [accountsInExtension, accountsInExtension.length, flattenHierarchy, hierarchy]);

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
