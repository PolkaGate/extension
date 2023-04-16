// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type TopMenu = 'Referenda' | 'Fellowship';

export const MAX_WIDTH = '1280px';

interface Reply {
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

interface Comment {
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

interface History {
  timestamp: Date,
  status: string,
  block: number
}

export interface ReferendumPolkassambly {
  bond: any,
  comments: Comment[],
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
  statusHistory: History[],
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
      statuses: History[],
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
  timeline: {
      block: number;
      status: string;
      time: number;
      prophecy: boolean;
      index: number;
      extrinsic_index: string;
      params: null;
  }[];
}
