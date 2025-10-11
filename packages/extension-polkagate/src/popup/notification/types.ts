// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';
import type { ReferendaStatus } from './constant';

export interface ApiResponse<T> {
  code: number;
  message: string;
  generated_at: number;
  data: T;
}

export interface TransferSubscan {
  transfer_id: number;
  from: string;
  from_account_display: AccountDisplay;
  to: string;
  to_account_display: AccountDisplayWithMerkle;
  extrinsic_index: string;
  success: boolean;
  hash: string;
  block_num: number;
  block_timestamp: number;
  module: string;
  amount: string;
  amount_v2: string;
  current_currency_amount: string;
  currency_amount: string;
  fee: string;
  nonce: number;
  asset_symbol: string;
  asset_unique_id: string;
  asset_type: string;
  item_id: string | null;
  event_idx: number;
  is_lock: boolean;
}

export interface PayoutSubscan {
  era: number;
  stash: string;
  account: string;
  validator_stash: string;
  extrinsic_index: string;
  amount: string;
  block_timestamp: number;
  module_id: string;
  event_id: string;
}

export interface ReferendaSubscan {
  referendum_index: number;
  created_block_timestamp: number;
  origins_id: number;
  origins: string;
  call_module: string;
  status: string;
  latest_block_timestamp: number;
  account: AccountDisplay;
  title: string;
}

interface AccountDisplay {
  address: string;
  people: Record<string, unknown>;
}

interface AccountDisplayWithMerkle extends AccountDisplay {
  merkle?: {
    address_type: string;
    tag_type: string;
    tag_subtype: string;
    tag_name: string;
  };
}

export interface TransfersProp {
  amount: string;
  assetSymbol: string;
  currencyAmount: string;
  date: string;
  from: string;
  fromAccountDisplay: AccountDisplay;
  toAccountId: AccountDisplay;
  timestamp: number;
}

export interface PayoutsProp {
  era: number;
  amount: string;
  date: string;
  timestamp: number;
}

export interface ReferendaProp {
  referendumIndex: number;
  createdTimestamp: number;
  chainName: string;
  originsId: number;
  origins: string;
  callModule: string;
  status: ReferendaStatus;
  latestTimestamp: number;
  account: AccountDisplay;
  title: string;
}

export interface ReceivedFundInformation {
  address: string;
  data: TransfersProp[];
  network: DropdownOption;
}

export interface StakingRewardInformation {
  address: string;
  data: PayoutsProp[];
  network: DropdownOption;
}

export interface ReferendaInformation {
  data: ReferendaProp[];
  network: DropdownOption;
}

// export interface ReferendaNotificationType {
//   chainName: string;
//   latestTimestamp: number;
//   status?: ReferendaStatus;
//   referendumIndex?: number;
// }

export type NotificationType = 'referenda' | 'stakingReward' | 'receivedFund';

export interface NotificationMessageType {
  chain?: DropdownOption;
  type: NotificationType;
  payout?: PayoutsProp;
  referenda?: ReferendaProp;
  receivedFund?: TransfersProp;
  forAccount?: string;
  extrinsicIndex?: string;
  read: boolean;
}

export interface NotificationsType {
  notificationMessages: NotificationMessageType[] | undefined;
  referendas: ReferendaInformation[] | null | undefined;
  receivedFunds: ReceivedFundInformation[] | null | undefined;
  stakingRewards: StakingRewardInformation[] | null | undefined;
  latestLoggedIn: number | undefined;
  isFirstTime: boolean | undefined;
}

export type NotificationActionType =
  | { type: 'INITIALIZE'; }
  | { type: 'CHECK_FIRST_TIME'; }
  | { type: 'MARK_AS_READ'; }
  | { type: 'LOAD_FROM_STORAGE'; payload: NotificationsType }
  | { type: 'SET_REFERENDA'; payload: ReferendaInformation[] }
  | { type: 'SET_RECEIVED_FUNDS'; payload: NotificationsType['receivedFunds'] }
  | { type: 'SET_STAKING_REWARDS'; payload: NotificationsType['stakingRewards'] };
