// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { type BN, BN_ZERO } from '@polkadot/util';

import { ExtensionPopup } from '../../../components';
import { useTranslation } from '../../../hooks';

enum SORTED_BY {
  INDEX,
  NAME,
  MOST_STAKED,
  LESS_STAKED,
  MOST_MEMBERS,
  LESS_MEMBERS,
  MOST_COMMISSION,
  LESS_COMMISSION
}

export interface PoolFilterState {
  sortBy: SORTED_BY;
  isVerified: boolean;
  commissionThreshold: number | undefined;
  stakedThreshold: BN;
  membersThreshold: number;
}

export type PoolFilterAction =
  | { type: 'RESET' }
  | { type: 'UPDATE'; payload: Partial<PoolFilterState> };

export const INITIAL_POOL_FILTER_STATE: PoolFilterState = {
  commissionThreshold: undefined,
  isVerified: false,
  membersThreshold: 0,
  sortBy: SORTED_BY.INDEX,
  stakedThreshold: BN_ZERO
};

export const poolFilterReducer = (state: PoolFilterState, action: PoolFilterAction): PoolFilterState => {
  switch (action.type) {
    case 'RESET':
      return INITIAL_POOL_FILTER_STATE;
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface Props {
  dispatchFilter: React.Dispatch<PoolFilterAction>;
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PoolFilter ({ dispatchFilter, openMenu, setOpenMenu }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleClose = useCallback(() => setOpenMenu(false), [setOpenMenu]);

  return (
    <ExtensionPopup
      handleClose={handleClose}
      openMenu={openMenu}
      title={t('Filters')}
      withoutBackground
      withoutTopBorder
    >
      <Stack direction='column' sx={{ height: '440px', position: 'relative', rowGap: '24px', width: '100%' }}>
        <Stack direction='column' sx={{ maxHeight: '390px', mb: '65px', overflowY: 'auto', rowGap: '12px' }}>
        </Stack>
      </Stack>
    </ExtensionPopup>
  );
}
