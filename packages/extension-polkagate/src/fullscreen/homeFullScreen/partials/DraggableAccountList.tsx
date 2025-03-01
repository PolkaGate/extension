// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useCallback, useLayoutEffect, useState } from 'react';

import AccountItem from './AccountItem';

interface Props {
  initialAccountList: AccountsOrder[];
}

export const saveNewOrder = (newOrder: AccountsOrder[]) => {
  const addressOrder = newOrder.map(({ account }) => account.address);

  chrome.storage.local.set({ addressOrder }).catch(console.error);
};

function DraggableAccountList({ initialAccountList }: Props) {
  const [accountsOrder, setAccountsOrder] = useState<AccountsOrder[]>(initialAccountList);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();

  useLayoutEffect(() => {
    setAccountsOrder(initialAccountList);
  }, [initialAccountList, initialAccountList.length]);

  const getItemPos = useCallback((_id: UniqueIdentifier | undefined) => accountsOrder?.findIndex(({ id }) => _id === id), [accountsOrder]);

  const handleDrag = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id === over?.id) {
      return;
    }

    const originalPosition = getItemPos(active.id);
    const newPosition = getItemPos(over?.id);

    const newOrder = arrayMove(accountsOrder, originalPosition, newPosition);

    saveNewOrder(newOrder);
    setAccountsOrder(newOrder);
  }, [accountsOrder, getItemPos]);

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[restrictToParentElement]} onDragEnd={handleDrag}>
      <SortableContext items={accountsOrder} strategy={verticalListSortingStrategy}>
        {accountsOrder.map(({ account, id }) => (
          <AccountItem
            account={account}
            id={id}
            key={id}
            quickActionOpen={quickActionOpen}
            setQuickActionOpen={setQuickActionOpen}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export default React.memo(DraggableAccountList);
