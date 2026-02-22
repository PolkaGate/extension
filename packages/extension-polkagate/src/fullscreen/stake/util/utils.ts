// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '@polkadot/extension-polkagate/util/types';

import { useCallback, useState } from 'react';

import { type BN, BN_ZERO, formatBalance, noop } from '@polkadot/util';

import { SORTED_BY } from '../../../popup/staking/partial/PoolFilter';
import { TRANSACTION_FLOW_STEPS } from '../../../util/constants';

export const DEFAULT_POOL_ITEMS_PER_PAGE = 10;
export const POOL_ITEMS_PAGINATION_OPTIONS = [
  { text: '10', value: 10 },
  { text: '20', value: 20 },
  { text: '50', value: 50 }
];

export enum StakingPopUps {
  NONE,
  INFO,
  WITHDRAW,
  RESTAKE,
  JOIN_CREATE_POOL,
  UNSTAKE,
  BOND_EXTRA,
  STAKE,
  FAST_UNSTAKE,
  CLAIM_REWARDS,
  PENDING_REWARDS,
  UNLOCKING,
  REWARD_DESTINATION_CONFIG,
  CREATE_POOL,
  MY_POOL,
  EASY_STAKE,
  STAKING_INFO
}

export interface SelectedEasyStakingType {
  type: 'solo' | 'pool';
  pool: PoolInfo | undefined;
  validators: string[] | undefined;
}
export enum EasyStakeSide {
  INPUT,
  STAKING_TYPE,
  SELECT_POOL,
  SELECT_VALIDATORS
}

export type PopupOpener = (popup: StakingPopUps) => () => void;
export type PopupCloser = () => void;

export function useStakingPopups() {
  const [stakingPopup, setStakingPopup] = useState<StakingPopUps>(StakingPopUps.NONE);

  const popupOpener: PopupOpener = useCallback((popup: StakingPopUps) => () => setStakingPopup(popup), []);
  const popupCloser: PopupCloser = useCallback(() => setStakingPopup(StakingPopUps.NONE), []);

  return { popupCloser, popupOpener, stakingPopup };
}

export const FULLSCREEN_STAKING_TX_FLOW = {
  ...TRANSACTION_FLOW_STEPS,
  NONE: 'none'
};

export type FullScreenTransactionFlow = typeof FULLSCREEN_STAKING_TX_FLOW[keyof typeof FULLSCREEN_STAKING_TX_FLOW];

interface CloseBehavior {
  showCloseIcon?: boolean;
  onClose: () => void;
}

export function getCloseBehavior(
  flowStep: FullScreenTransactionFlow,
  handleClosePopup: () => void,
  setFlowStep: (step: FullScreenTransactionFlow) => void,
  hasChildren?: boolean
): CloseBehavior {
  if (!hasChildren) {
    return {
      onClose: handleClosePopup,
      showCloseIcon: true
    };
  }

  switch (flowStep) {
    case FULLSCREEN_STAKING_TX_FLOW.NONE:
    case FULLSCREEN_STAKING_TX_FLOW.CONFIRMATION:
      return {
        onClose: handleClosePopup,
        showCloseIcon: true
      };

    case FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN:
      return {
        onClose: noop,
        showCloseIcon: undefined
      };

    case FULLSCREEN_STAKING_TX_FLOW.REVIEW:
    default:
      return {
        onClose: () => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE),
        showCloseIcon: false
      };
  }
}

// Helper function to calculate commission percentage
const getCommissionPercentage = (pool: PoolInfo) => {
  if (!pool.bondedPool?.commission?.current?.isSome) {
    return 0;
  }

  const rawCommission = pool.bondedPool.commission?.current?.value?.[0];
  const commission = Number(rawCommission) / (10 ** 7);

  return commission < 1 ? 0 : commission;
};

// Helper function to get member count
const getMemberCount = (pool: PoolInfo) => pool.bondedPool?.memberCounter?.toNumber() ?? 0;

// Helper function to get staked amount
const getStakedAmount = (pool: PoolInfo) => pool.bondedPool?.points ?? BN_ZERO;

// Sorting functions map
export const sortingFunctions = {
  [`${SORTED_BY.INDEX}`]: (a: PoolInfo, b: PoolInfo) => a.poolId - b.poolId,

  [SORTED_BY.LESS_COMMISSION]: (a: PoolInfo, b: PoolInfo) =>
    getCommissionPercentage(a) - getCommissionPercentage(b),

  [SORTED_BY.MOST_COMMISSION]: (a: PoolInfo, b: PoolInfo) =>
    getCommissionPercentage(b) - getCommissionPercentage(a),

  [SORTED_BY.MOST_MEMBERS]: (a: PoolInfo, b: PoolInfo) =>
    getMemberCount(b) - getMemberCount(a),

  [SORTED_BY.LESS_MEMBERS]: (a: PoolInfo, b: PoolInfo) =>
    getMemberCount(a) - getMemberCount(b),

  [SORTED_BY.MOST_STAKED]: (a: PoolInfo, b: PoolInfo) =>
    getStakedAmount(b).cmp(getStakedAmount(a)),

  [SORTED_BY.LESS_STAKED]: (a: PoolInfo, b: PoolInfo) =>
    getStakedAmount(a).cmp(getStakedAmount(b)),

  [`${SORTED_BY.NAME}`]: (a: PoolInfo, b: PoolInfo) => {
    const nameA = a.metadata?.toLowerCase() ?? '';
    const nameB = b.metadata?.toLowerCase() ?? '';

    return nameA.localeCompare(nameB);
  }
};

export type StakingType = 'solo' | 'pool' | 'both';

export enum POSITION_TABS {
  POSITIONS = 'positions',
  EXPLORE = 'explore'
}

export interface PositionsState {
  stakingType: StakingType;
  isTestnet: boolean;
  searchQuery: string;
  tab: POSITION_TABS;
}

export type PositionsAction =
  | { type: 'SET_STAKING_TYPE'; payload: StakingType }
  | { type: 'TOGGLE_TESTNET' }
  | { type: 'RESET' }
  | { type: 'SET_TAB', payload: POSITION_TABS }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

export const positionsInitialState: PositionsState = {
  isTestnet: false,
  searchQuery: '',
  stakingType: 'both',
  tab: POSITION_TABS.POSITIONS
};

export function positionsReducer(state: PositionsState, action: PositionsAction): PositionsState {
  switch (action.type) {
    case 'SET_STAKING_TYPE':
      return { ...state, stakingType: action.payload };
    case 'TOGGLE_TESTNET':
      return { ...state, isTestnet: !state.isTestnet };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_TAB':
      return { ...state, tab: action.payload };
    case 'RESET':
      return { ...positionsInitialState };
    default:
      return state;
  }
}

export function getTokenUnit(value: number | string | BN | bigint, decimals: number, token: string): string {
  const formatted = formatBalance(value, { decimals, withSi: true, withUnit: token });

  const match = formatted.match(/[\d,.]+\s*([a-zA-Z]+)$/);

  return match?.[1] || '';
}
