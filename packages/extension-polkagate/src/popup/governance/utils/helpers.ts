// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

import { postData } from '../../../util/api';
import { LatestReferenda, Origins } from './types';

export const LOCKS = [1, 10, 20, 30, 40, 50, 60];
export interface Statistics {
  'referendum_locked': string,
  'referendum_participate': string,
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

export async function getReferendumStatistics(chainName: string): Promise<Statistics | null> {
  console.log('Getting ref stat from sb ... ');

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/referenda/statistics',
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
    console.log('referendumIndex is undefined getting Referendum Votes ');

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

export async function getTrackReferendums(chainName: string, page = 1, track: number): Promise<string[] | null> {
  console.log(`Getting refs on ${chainName} track:${track}`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/listing/on-chain-posts?page=${page}&proposalType=referendums_v2&listingLimit=10&trackNo=${track}&trackStatus=All&sortBy=newest`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.posts?.length) {
        console.log(`Referendums on ${chainName}/ track:${track}:`, data.posts);

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

export async function getReferendum(chainName: string, postId: number): Promise<string[] | null> {
  console.log(`Getting ref #${postId} info from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/posts/on-chain-post?proposalType=referendums_v2&postId=${postId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        console.log(`Ref #${postId} info from PA:`, data);

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

export async function getReferendumFromSubscan(chainName: string, postId: number): Promise<Statistics | null> {
  console.log(`Getting ref #${postId} info from sb ...`);

  // Convert postId to uint
  const referendumIndex: number = postId >>> 0; // Use bitwise zero-fill right shift to convert to unsigned integer

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/referenda/referendum',
        {
          referendum_index: referendumIndex
        })
        .then((data: { message: string; data }) => {
          if (data.message === 'Success') {
            console.log(`Ref ${postId} info from Sb:`, data.data);

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
