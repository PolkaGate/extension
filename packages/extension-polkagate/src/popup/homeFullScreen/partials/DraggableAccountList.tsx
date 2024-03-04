// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useCallback, useState } from 'react';

import { AccountsOrder } from '..';
import AccountItem from './AccountItem';

interface Props {
  initialAccountList: AccountsOrder[];
  hideNumbers: boolean | undefined;
}

export default function DraggableAccountList ({ hideNumbers, initialAccountList }: Props) {
  const [accountsOrder, setAccountsOrder] = useState<AccountsOrder[]>(initialAccountList);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();

  const getItemPos = useCallback((_id) => accountsOrder?.findIndex(({ id }) => _id === id), [accountsOrder]);

  const handleDrag = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id === over?.id) {
      return;
    }

    const orgPos = getItemPos(active.id);
    const newPos = getItemPos(over?.id);

    setAccountsOrder(arrayMove(accountsOrder, orgPos, newPos));
  }, [accountsOrder, getItemPos]);

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[restrictToParentElement]} onDragEnd={handleDrag}>
      <SortableContext items={accountsOrder} strategy={verticalListSortingStrategy}>
        {accountsOrder.map(({ account, id }) => (
          <AccountItem
            account={account}
            hideNumbers={hideNumbers}
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
