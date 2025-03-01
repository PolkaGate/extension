// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { useCallback, useContext, useLayoutEffect, useState } from 'react';

import { AccountContext } from '../components';
import { saveNewOrder } from '../fullscreen/homeFullScreen/partials/DraggableAccountList';

export default function useAccountsOrder(isFullScreenMode?: boolean): AccountsOrder[] | undefined {
  const { accounts: accountsInExtension, hierarchy } = useContext(AccountContext);

  const [initialAccountList, setInitialAccountList] = useState<AccountsOrder[] | undefined>();

  const flattenHierarchy = useCallback((account: AccountWithChildren): AccountWithChildren[] => {
    const flattenedChildren = (account.children || []).flatMap(flattenHierarchy);

    return [account, ...flattenedChildren];
  }, []);

  useLayoutEffect(() => {
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
  }, [accountsInExtension, accountsInExtension.length, flattenHierarchy, hierarchy, setInitialAccountList]);

  return (isFullScreenMode
    ? initialAccountList
    : initialAccountList?.map(({ account }) => account)) as AccountsOrder[] | undefined;
}
