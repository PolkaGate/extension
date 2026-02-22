// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { BN } from '@polkadot/util';

export type Type = 'locked' | 'reserved';

export interface LockedReservedState {
  type: Type | undefined;
  data: {
    items: Record<string, BN | undefined>;
    titleIcon: Icon;
  } | undefined;
}

export type Action =
  | { type: 'OPEN_MENU'; payload: { menuType: Type; items: Record<string, BN | undefined>; titleIcon: Icon } }
  | { type: 'CLOSE_MENU' }
  | { type: 'UPDATE_ITEMS'; payload: Record<string, BN | undefined> };

export const lockedReservedReducer = (state: LockedReservedState, action: Action): LockedReservedState => {
  switch (action.type) {
    case 'OPEN_MENU':
      return {
        data: {
          items: action.payload.items,
          titleIcon: action.payload.titleIcon
        },
        type: action.payload.menuType
      };
    case 'CLOSE_MENU':
      return {
        data: undefined,
        type: undefined
      };
    case 'UPDATE_ITEMS':
      return state.data
        ? {
          ...state,
          data: {
            ...state.data,
            items: action.payload
          }
        }
        : state;
    default:
      return state;
  }
};
