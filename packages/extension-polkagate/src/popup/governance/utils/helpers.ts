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

export interface VoterData {
  voterAddress: string;
  voteType: string;
  conviction: number;
  voteAmount: number;
}

export function objectSpread(dest, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];

    if (src) {
      Object.assign(dest, src);
    }
  }

  return dest;
}

export function sortVotesWithConviction(votes = []) {
  return votes.sort((a, b) => {
    const ta = new BN(a.balance)
      .muln(LOCKS[a.conviction])
      .divn(10);
    const tb = new BN(b.balance)
      .muln(LOCKS[b.conviction])
      .divn(10);
      
    return new BN(ta).gt(tb) ? -1 : 1;
  });
}

export function extractAddressAndTrackId(storageKey = [], api) {
  const sectionRemoved = storageKey.slice(32);
  const accountHashRemoved = sectionRemoved.slice(8);
  const accountU8a = accountHashRemoved.slice(0, 32);

  const accountRemoved = accountHashRemoved.slice(32);
  const classIdU8a = accountRemoved.slice(8);

  const address = encodeAddress(accountU8a, api.registry.chainSS58);
  const trackId = api.registry.createType("U16", classIdU8a).toNumber();

  return {
    address,
    trackId,
  };
}

function normalizeVotingOfEntry([storageKey, voting], api) {
  const { address, trackId } = extractAddressAndTrackId(storageKey, api);
  return { account: address, trackId, voting };
}

function extractVotes(mapped, targetReferendumIndex) {
  return mapped
    .filter(({ voting }) => voting.isCasting)
    .map(({ account, voting }) => {
      return {
        account,
        votes: voting.asCasting.votes.filter(([idx]) =>
          idx.eq(targetReferendumIndex),
        ),
      };
    })
    .filter(({ votes }) => votes.length > 0)
    .map(({ account, votes }) => {
      return {
        account,
        vote: votes[0][1],
      };
    })
    .reduce((result, { account, vote }) => {
      if (vote.isStandard) {
        result.push(...extractStandardVote(account, vote));
      } else if (vote.isSplit) {
        result.push(...extractSplitVote(account, vote));
      } else if (vote.isSplitAbstain) {
        result.push(...extractSplitAbstainVote(account, vote));
      }

      return result;
    }, []);
}

function extractSplitVote(account, vote) {
  const split = vote.asSplit;
  const ayeBalance = split.aye.toBigInt().toString();
  const nayBalance = split.nay.toBigInt().toString();
  const common = {
    account,
    isDelegating: false,
    isSplit: true,
  };

  const result = [];
  if (split.aye.toBigInt() > 0) {
    result.push({
      ...common,
      balance: ayeBalance,
      aye: true,
      conviction: 0,
    });
  }
  if (split.nay.toBigInt() > 0) {
    result.push({
      ...common,
      balance: nayBalance,
      aye: false,
      conviction: 0,
    });
  }

  return result;
}

function extractSplitAbstainVote(account, vote) {
  const splitAbstain = vote.asSplitAbstain;
  const ayeBalance = splitAbstain.aye.toBigInt().toString();
  const nayBalance = splitAbstain.nay.toBigInt().toString();
  const abstainBalance = splitAbstain.abstain.toBigInt().toString();
  const common = {
    account,
    isDelegating: false,
    isSplitAbstain: true,
  };

  const result = [
    objectSpread(
      { ...common }, {
        balance: abstainBalance,
        isAbstain: true,
        conviction: 0,
      },
    ),
  ];

  if (splitAbstain.aye.toBigInt() > 0) {
    result.push(objectSpread(
      { ...common }, {
        balance: ayeBalance,
        aye: true,
        conviction: 0,
      }),
    );
  }
}

function extractStandardVote(account, vote) {
  const standard = vote.asStandard;
  const balance = standard.balance.toBigInt().toString();

  return [
    objectSpread(
      {
        account,
        isDelegating: false,
        isStandard: true,
      },
      {
        balance,
        aye: standard.vote.isAye,
        conviction: standard.vote.conviction.toNumber(),
      },
    ),
  ];
}

function extractDelegations(mapped, track, directVotes = []) {
  const delegations = mapped
    .filter(({ trackId, voting }) => voting.isDelegating && trackId === track)
    .map(({ account, voting }) => {
      return {
        account,
        delegating: voting.asDelegating,
      };
    });

  return delegations.reduce((result, { account, delegating: { balance, conviction, target } }) => {
      const to = directVotes.find(({ account, isStandard }) => account === target.toString() && isStandard);
      if (!to) {
        return result;
      }

      return [
        ...result,
        {
          account,
          balance: balance.toBigInt().toString(),
          isDelegating: true,
          aye: to.aye,
          conviction: conviction.toNumber(),
        },
      ];
    }, []);
}

export async function getReferendumVotes(api: ApiPromise, trackId: string, referendumIndex: number): Promise<VoterData[] | null> {
  console.log(`Getting referendum ${referendumIndex} votes ... `);

  if (!referendumIndex || !api) {
    console.log('referendumIndex is undefined getting Referendum Votes ');

    return null;
  }

  const voting = await api.query.convictionVoting.votingFor.entries();
  const mapped = voting.map((item) => normalizeVotingOfEntry(item, api));

  const directVotes = extractVotes(mapped, referendumIndex, api);
  const delegationVotes = extractDelegations(mapped, trackId, directVotes);
  const sorted = sortVotesWithConviction([...directVotes, ...delegationVotes]);

  const allAye = sorted.filter((v) => !v.isAbstain && v.aye);
  const allNay = sorted.filter((v) => !v.isAbstain && !v.aye);
  const allAbstain = sorted.filter((v) => v.isAbstain);
  return { allAye, allNay, allAbstain };
}

export async function getReferendumVotesFromSubscan(chainName: string, referendumIndex: number | undefined): Promise<string | null> {
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

export async function getReferendum(chainName: string, postId: number): Promise<string[] | null> {
  console.log(`Getting referendum #${postId} info from PA ...`);

  const requestOptions = {
    headers: { 'x-network': chainName.charAt(0).toLowerCase() + chainName.slice(1) }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`https://api.polkassembly.io/api/v1/posts/on-chain-post?proposalType=referendums_v2&postId=${postId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        console.log(`Referendum  #${postId} from PA:`, data);

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
  console.log(`Getting referendum #${postId} from subscan ...`);

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
            console.log('getReferendumFromSubscan:', data.data);

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
