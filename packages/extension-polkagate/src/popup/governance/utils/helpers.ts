// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';

import { postData } from '../../../util/api';
import { TRACK_LIMIT_TO_LOAD_PER_REQUEST } from './consts';
import { LatestReferenda, Origins, ReferendumPolkassembly, ReferendumSubScan, TopMenu } from './types';

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

export type VoteType = {
  decision: string;
  voter: string;
  balance: {
    value: string;
  };
  lockPeriod: number | null;
  isDelegated: boolean;
}

export type AbstainVoteType = {
  decision: string;
  voter: string;
  balance: {
    aye: string;
    nay: string;
    abstain: string;
  };
  lockPeriod: null;
  isDelegated: boolean;
}

export type AllVotesType = {
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

export async function getReferendumStatistics(chainName: string, type: 'referenda' | 'fellowship'): Promise<Statistics | null> {
  // console.log('Getting ref stat from sb ... ');

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + `.api.subscan.io/api/scan/${type}/statistics`,
        {
          'Content-Type': 'application/json'
        })
        .then((data: { message: string; data }) => {
          if (data.message === 'Success') {
            console.log('Referendum Statistics:', data.data);

            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum statistics');
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
        .then((data: { message: string; data: { count: number, list: string[]; } }) => {
          if (data.message === 'Success') {
            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum votes ');
      resolve(null);
    }
  });
}

export async function getLatestReferendums(chainName: string, listingLimit = 30): Promise<LatestReferenda[] | null> {
  console.log(`Getting Latest referendum on ${chainName} from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/latest-activity/all-posts?govType=open_gov&listingLimit=${listingLimit}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.posts?.length) {
        console.log(`Latest referendum on ${chainName} from PA:`, data.posts);

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
  console.log(`Getting All Votes on ${chainName} for refIndex ${refIndex} from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/votes?postId=${refIndex}&page=1&listingLimit=${listingLimit}&voteType=${isFellowship ? 'Fellowship' : 'ReferendumV2'}&sortBy=time`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        console.log(`All votes on ${chainName} from PA:`, data);

        return data;
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.log(`Error getting latest referendum on ${chainName}:`, error.message);

      return null;
    });
}

export async function getTrackOrFellowshipReferendumsPA(chainName: string, page = 1, track?: number): Promise<LatestReferenda[] | null> {
  console.log(`Getting refs on ${chainName} track:${track} from PA`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/listing/on-chain-posts?page=${page}&proposalType=${track ? 'referendums_v2' : 'fellowship_referendums'}&listingLimit=${TRACK_LIMIT_TO_LOAD_PER_REQUEST}&trackNo=${track}&trackStatus=All&sortBy=newest`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.posts?.length) {
        console.log(`Referendums on ${chainName}/ track:${track} from PA:`, data.posts);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

export async function getReferendumPA(chainName: string, type: TopMenu, postId: number): Promise<ReferendumPolkassembly | null> {
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
        return data;
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

export async function getReferendumSb(chainName: string, type: TopMenu, postId: number): Promise<ReferendumSubScan | null> {
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
        .then((data: { message: string; data }) => {
          if (data.message === 'Success') {
            // console.log(`Ref ${postId} info from Sb:`, data.data);

            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum statistics');
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

export async function getReferendumsListSb(chainName: string, type: TopMenu, listingLimit = 30): Promise<RefListSb | null> {
  console.log('Getting ref list from sb ...');

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + `.api.subscan.io/api/scan/${type.toLocaleLowerCase()}/referendums`,
        {
          // page:1,
          row: listingLimit
          // status:	//completed | active
          // Origins:
        })
        .then((data: { message: string; data }) => {
          if (data.message === 'Success') {
            console.log('Ref list from Sb:', data.data);

            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendums list');
      resolve(null);
    }
  });
}

export async function getTreasuryProposalNumber(referendumIndex: number, api: ApiPromise): Promise<number> {
  // Get the referendum information
  // const referendumInfo = await api.query.democracy.referendumInfoOf(referendumIndex);
  // Get the referendum information
  const referendumInfo = await api.query.democracy.referendumInfoOf(referendumIndex);
  console.log('referendumInfo.unwrap():', referendumInfo.unwrap().toString())

  // Get the proposal index from the referendum information
  const proposalIndex = referendumInfo.unwrap().index.toNumber();

  // console.log('referendumInfo.toHuman():',referendumInfo.toHuman())
  // Get the proposal index from the referendum
  // const proposalIndex = referendumInfo.toHuman().index as number;

  // Get the treasury proposal information
  const proposal = await api.query.treasury.proposals(proposalIndex);

  // Get the proposal number from the proposal information
  const proposalNumber = proposal.toHuman().proposal.id as number;

  return proposalNumber;
}
