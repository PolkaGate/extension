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

export interface Transfer {
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

export interface Payout {
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
  from: string,
  fromAccountDisplay: AccountDisplay,
  toAccountId: AccountDisplay,
  date: string,
  timestamp: number;
  amount: string,
  assetSymbol: string
}

export interface PayoutsProp {
  era: number;
  validatorStash: string;
  amount: string;
  date: string;
  decimal: number;
  timestamp: number;
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

export interface WorkerMessage {
  functionName: string;
  message: {
    type: 'referenda';
    chainGenesis: string;
    data: { refId: number; status: ReferendaStatus; }[];
  }
}

export interface ReferendaNotificationType {
  status?: ReferendaStatus;
  refId?: number;
  chainName: string;
}

export type NotificationType = 'referenda' | 'stakingReward' | 'receivedFund';

export interface NotificationMessageType {
  chain?: DropdownOption;
  type: NotificationType;
  payout?: PayoutsProp;
  referenda?: ReferendaNotificationType;
  receivedFund?: TransfersProp;
  forAccount?: string;
  extrinsicIndex?: string;
  read: boolean;
}

export interface NotificationsType {
  notificationMessages: NotificationMessageType[] | undefined;
  referendas: ReferendaNotificationType[] | null | undefined;
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
  | { type: 'SET_REFERENDA'; payload: ReferendaNotificationType[] }
  | { type: 'SET_RECEIVED_FUNDS'; payload: NotificationsType['receivedFunds'] }
  | { type: 'SET_STAKING_REWARDS'; payload: NotificationsType['stakingRewards'] };
