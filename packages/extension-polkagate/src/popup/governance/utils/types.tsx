// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN } from '@polkadot/util';

export type TopMenu = 'Referenda' | 'Fellowship';
export type Origins = 'root' | 'whitelisted_caller' | 'staking_admin' | 'treasurer' | 'lease_admin' | 'general_admin' | 'auction_admin' | 'referendum_canceller' | 'small_tipper' | 'big_tipper' | 'small_spender' | 'medium_spender' | 'big_spender';

export interface Reply {
  content: string;
  created_at: Date,
  id: string,
  proposer: string,
  updated_at: Date,
  user_id: number,
  username: string
}

interface Reaction {
  '👍': {
    count: number,
    usernames: string[]
  },
  '👎': {
    count: number,
    usernames: []
  }
}

export interface CommentType {
  comment_reactions: Reaction,
  content: string,
  created_at: Date,
  id: string,
  proposer: string,
  replies: Reply[],
  sentiment: number,
  updated_at: Date,
  user_id: number,
  username: string
}

export interface ReferendumHistory {
  timestamp: Date,
  status: string,
  block: number
}

export interface ReferendumPA {
  bond: any;
  chainName: 'Polkadot' | 'Kusama';
  comments: CommentType[];
  content: string;
  created_at: number;
  curator: any;
  curator_deposit: any;
  deciding: {
    confirming: any;
    since: number;
  };
  decision_deposit_amount: string;
  delay: any;
  deposit: any;
  description: any;
  enactment_after_block: number;
  enactment_at_block: any;
  end: any;
  ended_at: Date;
  fee: any;
  hash: string;
  last_edited_at: Date;
  method: string;
  origin: string;
  payee: null;
  post_id: number;
  post_reactions: Reaction;
  proposal_arguments: any;
  proposed_call: {
    args: Record<string, any>;
    description: string;
    method: string;
    section: string;
  };
  proposer: string;
  requested: string;
  reward: any;
  spam_users_count: number;
  status: string;
  statusHistory: ReferendumHistory[];
  submission_deposit_amount: string;
  submitted_amount: string;
  tally: {
    ayes: string;
    bareAyes: string;
    nays: string;
    support: string;
  };
  timeline: [
    {
      created_at: Date;
      hash: string;
      index: number;
      statuses: ReferendumHistory[];
      type: string;
    }
  ];
  title: string;
  topic: {
    id: number;
    name: string;
  };
  track_number: number;
  type: string;
  user_id: number;
  tags: any[];
  post_link: any;
}

export interface Timeline {
  block: number;
  status: string;
  time: number;
  timestamp?: Date;
  prophecy: boolean;
  index: number;
  extrinsic_index: string;
  params: null;
}

export interface ReferendumSb {
  ayes_amount: string;
  ayes_count: number;
  abstains_count: number;
  account: {
    address: string;
    display: string;
    identity: boolean;
  };
  bare_ayes: string;
  beneficiary: {
    address: string;
    display: string;
    identity: boolean;
  };
  beneficiary_amount: string;
  chainName: 'Polkadot' | 'Kusama';
  created_block: number;
  created_block_timestamp: number;
  decision_deposit_account: {
    address: string;
    display: string;
    identity: boolean;
  };
  decision_deposit_balance: string;
  deposit_balance: string;
  latest_block_num: number;
  latest_block_timestamp: number;
  nays_amount: string;
  nays_count: number;
  origins: string;
  origins_id: number;
  pre_image: {
    amount: string;
    author: {
      address: string;
      display: string;
      identity: boolean;
    };
    call_module: string;
    call_name: string;
    created_block: number;
    hash: string;
    params: string;
    status: string;
    updated_block: number;
  };
  referendum_index: number;
  status: string;
  support_amount: string;
  timeline: Timeline[];
}

export interface Proposal {
  id: number;
  proposer: string;
  value: number;
  beneficiary: string;
  bond: number;
}

export interface LatestReferenda {
  created_at: string;
  description: string;
  hash: string;
  method: string;
  origin: string;
  parent_bounty_index: any;
  post_id: number;
  proposer: string;
  status: string;
  title: string;
  track_number: number;
  type: string;
  fellowship_origins?: string;
  fellowship_origins_id?: number
}

export type Track = [
  id: BN,
  info: PalletReferendaTrackInfo
];

export type Referendum = {
  ayesAmount?: string | undefined,
  ayesCount?: number | undefined,
  call?: {
    args: Record<string, any>,
    description: string,
    method: string,
    section: string
  } | undefined,
  chainName?: 'Polkadot' | 'Kusama' | string,
  comments?: CommentType[] | undefined,
  content?: string | undefined,
  created_at?: number | undefined,
  decisionDepositAmount?: string | undefined,
  decisionDepositPayer?: string | undefined,
  enactAfter?: number | undefined,
  hash?: string | undefined,
  index: number,
  method?: string | undefined,
  naysAmount?: string | undefined,
  naysCount?: number | undefined,
  proposer?: string | undefined,
  requested?: string | undefined,
  requestedFor?: string | undefined,
  status?: string | undefined,
  statusHistory?: ReferendumHistory[] | undefined,
  submissionAmount?: string | undefined,
  supportAmount?: string | undefined,
  title?: string | undefined,
  timelinePA?: {
    created_at: Date,
    hash: string,
    index: number,
    statuses: ReferendumHistory[],
    type: string
  }[] | undefined,
  timelineSb?: Timeline[] | undefined,
  trackId?: number | undefined,
  trackName?: string | undefined,
  type?: string | undefined
};

export interface DelegationInfo {
  track: BN;
  delegatedBalance: BN;
  delegatee: AccountId;
  conviction: number;
}
