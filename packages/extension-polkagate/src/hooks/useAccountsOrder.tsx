// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { useCallback, useContext, useLayoutEffect, useState } from 'react';

import { AccountContext } from '../components';
import { getStorage } from '../util';

export const saveNewOrder = (newOrder: AccountsOrder[]) => {
  const addressOrder = newOrder.map(({ account }) => account.address);

  chrome.storage.local.set({ addressOrder }).catch(console.error);
};

export default function useAccountsOrder (): AccountsOrder[] | undefined {
  const { accounts: flatAccounts, hierarchy } = useContext(AccountContext);
  const [orderedAccounts, setOrderedAccounts] = useState<AccountsOrder[]>();

  const flattenHierarchy = useCallback((account: AccountWithChildren): AccountWithChildren[] => {
    return [account, ...(account.children || []).flatMap(flattenHierarchy)];
  }, []);

  useLayoutEffect(() => {
    const applyAccountOrder = async () => {
      try {
        const { addressOrder } = await getStorage('addressOrder') as { addressOrder?: string[] };

        const orderedList: AccountsOrder[] = [];
        const usedAddresses = new Set<string>();
        let id = 1;

        // Match stored order
        if (addressOrder?.length) {
          for (const addr of addressOrder) {
            const match = flatAccounts.find(({ address }) => address === addr);

            if (match) {
              orderedList.push({ account: match, id: id++ });
              usedAddresses.add(addr);
            }
          }
        }

        // Handle new or missing accounts
        const newAccounts = flatAccounts.filter(({ address }) => !usedAddresses.has(address));
        const parentMap = new Map(flatAccounts.map((acc) => [acc.address, acc]));

        for (const acc of newAccounts) {
          if (acc.parentAddress && parentMap.has(acc.parentAddress)) {
            const parentIndex = orderedList.findIndex(({ account }) => account.address === acc.parentAddress);

            if (parentIndex >= 0) {
              orderedList.splice(parentIndex + 1, 0, { account: acc, id: parentIndex + 2 });

              // Reassign IDs
              for (let i = parentIndex + 2; i < orderedList.length; i++) {
                orderedList[i].id = i + 1;
              }

              id = orderedList.length + 1;
              continue;
            }
          }

          orderedList.push({ account: acc, id: id++ });
        }

        saveNewOrder(orderedList);
        setOrderedAccounts(orderedList);
      } catch (error) {
        console.error('Failed to retrieve account order:', error);
        // fallback: flat + hierarchical merge
        const flattened = hierarchy.flatMap(flattenHierarchy);
        const fallbackOrder = flattened.map((account, idx) => ({ account, id: idx + 1 }));

        saveNewOrder(fallbackOrder);
        setOrderedAccounts(fallbackOrder);
      }
    };

    applyAccountOrder().catch(console.error);
  }, [flatAccounts, flattenHierarchy, hierarchy]);

  return orderedAccounts;
}
