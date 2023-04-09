// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { postData } from '../../util/api';

export type Origins = 'root' | 'whitelisted_caller' | 'staking_admin' | 'treasurer' | 'lease_admin' | 'general_admin' | 'auction_admin' | 'referendum_canceller' | 'small_tipper' | 'big_tipper' | 'small_spender' | 'medium_spender' | 'big_spender';

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
  console.log('Getting referendum statistics from subscan ... ');

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

export async function getReferendumVotes(chainName: string, referendumIndex: number | undefined): Promise<string | null> {
  if (!referendumIndex) {
    console.log('referendumIndex is undefined getting Referendum Votes ');

    return null;
  }

  console.log(`Getting referendum ${referendumIndex} votes from subscan ... `);

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
            console.log(data.data)

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

export async function getLatestReferendums(chainName: string): Promise<string[] | null> {
  console.log(`Getting referendum on ${chainName}...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch('https://api.polkassembly.io/api/v1/latest-activity/all-posts?govType=open_gov&listingLimit=20', requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.posts?.length) {
        console.log(`Latest referendum on ${chainName}:`, data.posts);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data.posts;
      } else {
        console.log(`Fetching message ${data}`);

        return null;
      }
    })
    .catch((error) => {
      console.log(`Error getting referendum on ${chainName}:`, error.message);

      return null;
    });
}

export async function getTrackReferendums(chainName: string, page = 1, track: number): Promise<string[] | null> {
  console.log(`Getting referendums on ${chainName} track:${track}`);

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
