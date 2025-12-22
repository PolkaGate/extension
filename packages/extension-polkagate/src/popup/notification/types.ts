// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

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
  index: number | string | undefined;
  toAccountId: AccountDisplay;
  timestamp: number;
}

export interface PayoutsProp {
  era: number;
  amount: string;
  date: string;
  index: number | string | undefined;
  timestamp: number;
}

export type ReferendaStatus = 'approved' | 'cancelled' | 'decision' | 'executed' | 'ongoing' | 'rejected' | 'submitted' | 'timeout' | 'confirm' | 'executedfailed';

export interface ReferendaProp {
  referendumIndex: number;
  createdTimestamp: number;
  chainName: string;
  index: number | undefined;
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

export type NotificationType = 'referenda' | 'stakingReward' | 'receivedFund';

export interface NotificationMessageType {
  chain?: DropdownOption;
  type: NotificationType;
  itemKey: string;
  forAccount?: string;
  payout?: PayoutsProp;
  referenda?: ReferendaProp;
  receivedFund?: TransfersProp;
}

export interface NotificationsType {
  notificationMessages: NotificationMessageInformation[] | undefined;
  latestLoggedIn: number | undefined;
  isFirstTime: boolean | undefined;
}

export type NotificationActionType =
  | { type: 'INITIALIZE'; }
  | { type: 'MARK_AS_READ'; }
  | { type: 'LOAD_FROM_STORAGE'; payload: NotificationsType }
  | { type: 'SET_MESSAGES'; payload: NotificationMessageType[] };

export interface NotificationMessageDetail {
  description: {
    text: string;
    textInColor: string;
  };
  iconInfo: {
    itemIcon: string;
    bgcolor: string;
    borderColor: string;
    color: string;
  },
  itemKey: string;
  time: string;
  timestamp: number;
  title: string;
}

export interface NotificationMessage {
  detail: NotificationMessageDetail,
  info: {
    chain?: DropdownOption;
    type: NotificationType;
    forAccount?: string;
  }
}

export interface NotificationMessageInformation {
  message: NotificationMessageType,
  read: boolean;
}
