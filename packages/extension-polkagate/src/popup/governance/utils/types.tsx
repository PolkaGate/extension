// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountId } from '@polkadot/types/interfaces/runtime';

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

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

export interface ReferendumPolkassembly {
  bond: any,
  comments: CommentType[],
  content: string,
  created_at: Date,
  curator: any,
  curator_deposit: any,
  deciding: {
    confirming: any,
    since: number
  },
  decision_deposit_amount: string,
  delay: any,
  deposit: any,
  description: any,
  enactment_after_block: number,
  enactment_at_block: any,
  end: any,
  ended_at: Date,
  fee: any,
  hash: string,
  last_edited_at: Date,
  method: string,
  origin: string,
  payee: null,
  post_id: number,
  post_reactions: Reaction,
  proposal_arguments: any,
  proposed_call: {
    method: string,
    args: Record<string, any>,
    description: string
    section: string
  },
  proposer: string,
  requested: string,
  reward: any,
  status: string,
  statusHistory: ReferendumHistory[],
  submission_deposit_amount: string,
  submitted_amount: string,
  tally: {
    ayes: string,
    bareAyes: string,
    nays: string,
    support: string
  },
  timeline: [
    {
      created_at: Date,
      hash: string,
      index: number,
      statuses: ReferendumHistory[],
      type: string
    }
  ],
  topic: {
    id: number,
    name: string,
  },
  track_number: number,
  type: string,
  user_id: number,
  title: string,
  tags: any[],
  post_link: any,
  spam_users_count: number
}

export interface Timeline {
  block: number;
  status: string;
  time: number;
  prophecy: boolean;
  index: number;
  extrinsic_index: string;
  params: null;
}

export interface ReferendumSubScan {
  referendum_index: number;
  created_block: number;
  created_block_timestamp: number;
  origins_id: number;
  origins: string;
  account: {
    address: string;
    display: string;
    identity: boolean;
  };
  deposit_balance: string;
  decision_deposit_account: {
    address: string;
    display: string;
    identity: boolean;
  };
  decision_deposit_balance: string;
  status: string;
  latest_block_num: number;
  latest_block_timestamp: number;
  pre_image: {
    hash: string;
    created_block: number;
    updated_block: number;
    status: string;
    amount: string;
    call_module: string;
    call_name: string;
    params: string;
    author: {
      address: string;
      display: string;
      identity: boolean;
    };
  };
  beneficiary: {
    address: string;
    display: string;
    identity: boolean;
  };
  beneficiary_amount: string;
  ayes_amount: string;
  ayes_count: number;
  nays_amount: string;
  nays_count: number;
  abstains_count: number;
  support_amount: string;
  bare_ayes: string;
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
  comments?: CommentType[] | undefined,
  content?: string | undefined,
  created_at?: Date | undefined,
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
