// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';
import type { CommentType, LatestReferenda, Origins, Referendum, ReferendumPA, ReferendumSb, Reply, TopMenu } from './types';

import { postData } from '../../../util/api';
import { FINISHED_REFERENDUM_STATUSES, TRACK_LIMIT_TO_LOAD_PER_REQUEST } from './consts';

export const LOCKS = [1, 10, 20, 30, 40, 50, 60];
export interface Statistics {
  'referendum_locked': string,
  'referendum_participate'?: string,
  'active_fellowship_members'?: string,
  'fellowship_members'?: string;
  'voting_total': number,
  'confirm_total': number,
  'origins':
  {
    'ID': number,
    'Origins': Origins,
    'Count': number
  }[],
  'OriginsCount': number
}

interface DataSS {
  items: CommentItemSS[];
  page: number;
  pageSize: number;
  total: number;
}

interface VoteSS {
  account: string;
  aye: boolean;
  balance: string;
  conviction: number;
  delegations: {
    votes: string;
    capital: string;
  };
  isDelegating: boolean;
  isSplit: boolean;
  isSplitAbstain: boolean;
  isStandard: boolean;
  queryAt: number;
  referendumIndex: number;
  votes: string;
}

interface CommentItemSS {
  author: {
    username: string;
    cid: string;
  };
  content: string;
  contentType: string;
  contentVersion: string;
  createdAt: string;
  dataSource: string;
  height: number;
  proposer: string;
  reactions: ReactionSS[];
  referendaReferendum: string;
  replies: ReplySS[];
  updatedAt: string;
  _id: string;
}

interface ReplySS {
  _id: string;
  referendaReferendum: string;
  replyToComment: string;
  content: string;
  contentType: string;
  contentVersion: string;
  author: {
    username: string;
    publicKey: string;
    address: string;
  };
  height: number;
  createdAt: string;
  updatedAt: string;
  dataSource: string;
  cid: string;
  proposer: string;
  reactions: ReactionSS[];
}

interface ReactionSS {
  _id: string,
  comment: string,
  dataSource: string,
  proposer: string,
  cid: string,
  createdAt: string,
  parentCid: string,
  reaction: number,
  updatedAt: string,
  user: {
    address: string;
    publicKey: string;
    username: string;
  } | null
}

export interface VoteType {
  decision: string;
  voter: string;
  balance: {
    value: string;
  };
  lockPeriod: number | null;
  isDelegated: boolean;
  delegatee?: AccountId32;
  votePower?: BN;
}

export interface AbstainVoteType {
  decision: string;
  voter: string;
  balance: {
    aye?: string; // when vote is standard
    nay?: string; // when vote is standard
    abstain?: string; // when vote is standard
    value?: string; // when vote is delegated
  };
  lockPeriod: null;
  isDelegated: boolean;
  delegatee?: AccountId32;
  votePower?: BN;
}

export interface AllVotesType {
  abstain: {
    count: number;
    votes: AbstainVoteType[];
  },
  no: {
    count: number;
    votes: VoteType[];
  }
  yes: {
    count: number;
    votes: VoteType[];
  }
}

export interface FilteredVotes {
  abstain: AbstainVoteType[];
  no: VoteType[];
  yes: VoteType[];
}

export const isFinished = (referendum: Referendum | undefined) => referendum?.status ? FINISHED_REFERENDUM_STATUSES.includes(referendum.status) : undefined;

export async function getReferendumStatistics(chainName: string, type: 'referenda' | 'fellowship'): Promise<Statistics | null> {
  // console.log('Getting ref stat from sb ... ');

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + `.api.subscan.io/api/scan/${type}/statistics`,
        {
          'Content-Type': 'application/json'
        })
        .then((data: { message: string; data: Statistics | PromiseLike<Statistics | null> | null }) => {
          if (data.message === 'Success') {
            // console.log('Referendum Statistics:', data.data);

            resolve(data.data);
          } else {
            // console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum statistics', error);
      resolve(null);
    }
  });
}

export async function getReferendumVotesFromSubscan(chainName: string, referendumIndex: number | undefined): Promise<string | null> {
  if (!referendumIndex) {
    console.log('referendumIndex is undefined while getting Referendum Votes from Sb ');

    return null;
  }

  console.log(`Getting ref ${referendumIndex} votes from sb ... `);

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/referenda/votes',
        {
          page: 2,
          referendum_index: referendumIndex,
          row: 99
        })
        .then((data: { message: string; data: string | PromiseLike<string | null> | null }) => {
          if (data.message === 'Success') {
            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum votes ', error);
      resolve(null);
    }
  });
}

export async function getLatestReferendums(chainName: string, listingLimit = 30): Promise<LatestReferenda[] | null> {
  // console.log(`Getting Latest referendum on ${chainName} from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/latest-activity/all-posts?govType=open_gov&listingLimit=${listingLimit}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.posts?.length) {
        // console.log(`Latest referendum on ${chainName} from PA:`, data.posts);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data.posts;
      } else {
        console.log(`Fetching message ${data}`);

        return null;
      }
    })
    .catch((error) => {
      console.log(`Error getting latest referendum on ${chainName}:`, error.message);

      return null;
    });
}

export async function getAllVotesFromPA(chainName: string, refIndex: number, listingLimit = 100, isFellowship: boolean | undefined): Promise<AllVotesType | null> {
  // console.log(`Getting All Votes on ${chainName} for refIndex: ${refIndex} from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/votes?postId=${refIndex}&page=1&listingLimit=${listingLimit}&voteType=${isFellowship ? 'Fellowship' : 'ReferendumV2'}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        // console.log(`All votes on ${chainName} from PA:`, data);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.log(`Error getting latest referendum on ${chainName}:`, error);

      return null;
    });
}

export async function getTrackOrFellowshipReferendumsPA(chainName: string, page = 1, track?: number): Promise<LatestReferenda[] | null> {
  console.log(`Getting refs on ${chainName} track:${track} from PA`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/listing/on-chain-posts?page=${page}&proposalType=${track !== undefined ? 'referendums_v2' : 'fellowship_referendums'}&listingLimit=${TRACK_LIMIT_TO_LOAD_PER_REQUEST}&trackNo=${track}&trackStatus=All&sortBy=newest`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.posts?.length) {
        console.log(`Referendums on ${chainName}/ track:${track} from PA:`, data.posts);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return data.posts;
      } else {
        console.log('Fetched message:', data);

        return null;
      }
    })
    .catch((error) => {
      console.log(`Error getting referendum on ${chainName}:`, error.message);

      return null;
    });
}

export async function getReferendumPA(chainName: string, type: TopMenu, postId: number): Promise<ReferendumPA | null> {
  // console.log(`Getting ref #${postId} info with type:${type} on chain:${chainName}  from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  const _type = type.toLocaleLowerCase() === 'referenda' ? 'referendums_v2' : 'fellowship_referendums';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/posts/on-chain-post?proposalType=${_type}&postId=${postId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        // console.log(`Ref #${postId} info from PA:`, data);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...data, chainName };
      } else {
        console.log('Fetched message:', data);

        return null;
      }
    })
    .catch((error) => {
      console.log(`Error getting referendum #${postId}:`, error.message);

      return null;
    });
}

export async function getReferendumSb(chainName: string, type: TopMenu, postId: number): Promise<ReferendumSb | null> {
  // console.log(`Getting ref #${postId} info from sb ...`);

  // Convert postId to uint
  const referendumIndex: number = postId >>> 0; // Use bitwise zero-fill right shift to convert to unsigned integer

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + `.api.subscan.io/api/scan/${type.toLocaleLowerCase()}/referendum`,
        {
          referendum_index: referendumIndex
        })
        .then((data: { message: string; data: ReferendumSb }) => {
          if (data.message === 'Success') {
            // console.log(`Ref ${postId} info from Sb:`, data.data);
            const ref = data.data;

            ref.timeline?.forEach((r) => {
              r.timestamp = r.time ? new Date(r.time * 1000).toISOString() as unknown as Date : undefined;
            });

            resolve({ ...ref, chainName });
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum statistics', error);
      resolve(null);
    }
  });
}

interface RefListSb {
  count: number;
  list: {
    referendum_index: number;
    created_block: number;
    created_block_timestamp: number;
    origins_id: number;
    origins: string;
    account: {
      address: string;
      display?: string;
      judgements?: {
        index: number;
        judgement: string;
      }[];
      identity?: boolean;
      account_index?: string;
    };
    call_module: string;
    call_name: string;
    status: string;
    latest_block_num: number;
    latest_block_timestamp: number;
  }[];
}

export async function getReferendumsListSb(chainName: string, type: 'referenda' | 'fellowship', listingLimit = 30): Promise<RefListSb | null> {
  console.log('Getting ref list from sb ...');

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + `.api.subscan.io/api/scan/${type.toLowerCase()}/referendums`,
        {
          // page:1,
          row: listingLimit
          // status://completed | active
          // Origins:
        })
        .then((data: { message: string; data: RefListSb | PromiseLike<RefListSb | null> | null }) => {
          if (data.message === 'Success') {
            console.log('Ref list from Sb:', data.data);

            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendums list', error);
      resolve(null);
    }
  });
}

/**
 * Fetches and formats comments for a specific referendum from SubSquare.
 * @param chainName The name of the blockchain.
 * @param refId The ID of the referendum.
 * @returns A promise that resolves to an array of formatted comments or null if an error occurs.
 */
export async function getReferendumCommentsSS(chainName: string, refId: string | number): Promise<CommentType[] | null> {
  // console.log(`Getting comments of ref ${refId} from SS ...`);

  try {
    // Fetch both comments and votes concurrently
    const [commentsResponse, votesResponse] = await Promise.all([
      fetch(`https://${chainName}.subsquare.io/api/gov2/referendums/${refId}/comments`),
      fetch(`https://${chainName}.subsquare.io/api/gov2/referenda/${refId}/votes`)
    ]);

    const comments = await commentsResponse.json() as DataSS;
    const votes = await votesResponse.json() as VoteSS[];

    // Helper function to determine the vote decision
    const voteInformation = (address: string): string | null => {
      const vote = votes.find(({ account }) => account === address);

      if (!vote) {
        return null;
      }

      if (vote.aye) {
        return 'yes';
      }

      if (vote.isSplit || vote.isSplitAbstain) {
        return 'abstain';
      }

      return 'no';
    };

    // Format the comments
    const formattedComments = comments.items.map(({ _id, author, content, createdAt, proposer, reactions, replies, updatedAt }) => {
      const decision = voteInformation(proposer);

      return {
        commentSource: 'SS',
        comment_reactions: {
          '👍': { count: reactions.length, usernames: reactions.map((reaction) => reaction.user?.address ?? '') ?? null },
          '👎': { count: 0, usernames: undefined } // SubSquare does not display dislikes
        },
        content,
        created_at: createdAt,
        id: _id,
        proposer,
        // Format replies
        replies: replies.map(({ _id, cid, content, createdAt, proposer, reactions, updatedAt }) => ({
          commentSource: 'SS',
          content,
          created_at: createdAt,
          id: _id,
          proposer,
          reply_reactions: {
            '👍': { count: reactions.length, usernames: reactions.map((reaction) => reaction.user?.address ?? '') ?? null },
            '👎': { count: 0, usernames: undefined } // SubSquare does not display dislikes
          },
          updated_at: updatedAt,
          user_id: cid,
          username: ''
        } as unknown as Reply)),
        sentiment: 0,
        updated_at: updatedAt,
        user_id: author.cid,
        username: '',
        votes: decision ? [{ decision }] : []
      } as unknown as CommentType;
    });

    return formattedComments;
  } catch (error) {
    console.error(`Error in getReferendumCommentsSS for chain ${chainName}, referendum ${refId}:`, error);

    return null;
  }
}
