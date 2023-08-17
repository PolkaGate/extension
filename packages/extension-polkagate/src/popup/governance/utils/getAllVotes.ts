// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

import { LatestReferenda, Origins } from './types';

export const LOCKS = [1, 10, 20, 30, 40, 50, 60];

// export interface VoterData {
//   voterAddress: string;
//   voteType: string;
//   conviction: number;
//   voteAmount: number;
// }

export interface VoterData {
  account: string;
  balance: string;
  conviction: number;
  isDelegating?: boolean;
  isStandard?: boolean;
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

export function extractAddressAndTrackId(storageKey = [], api: ApiPromise) {
  const sectionRemoved = storageKey.slice(32) as string;
  const accountHashRemoved = sectionRemoved.slice(8);
  const accountU8a = accountHashRemoved.slice(0, 32);

  const accountRemoved = accountHashRemoved.slice(32);
  const classIdU8a = accountRemoved.slice(8);

  const address = encodeAddress(accountU8a, api.registry.chainSS58);
  const trackId = api.registry.createType('U16', classIdU8a).toNumber() as number;

  return {
    address,
    trackId
  };
}

function normalizeVotingOfEntry([storageKey, voting], api): { account: string, trackId: number, voting: any } {
  const { address, trackId } = extractAddressAndTrackId(storageKey, api);

  return { account: address, trackId, voting };
}

function extractVotes(mapped, targetReferendumIndex): { account: string, votes: any } {
  return mapped
    .filter(({ voting }) => voting.isCasting)
    .map(({ account, voting }) => {
      return {
        account,
        votes: voting.asCasting.votes.filter(([idx]) =>
          idx.eq(targetReferendumIndex)
        )
      };
    })
    .filter(({ votes }) => votes.length > 0)
    .map(({ account, votes }) => {
      return {
        account,
        vote: votes[0][1]
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
    isSplit: true
  };

  const result = [];

  if (split.aye.toBigInt() > 0) {
    result.push({
      ...common,
      balance: ayeBalance,
      aye: true,
      conviction: 0
    });
  }

  if (split.nay.toBigInt() > 0) {
    result.push({
      ...common,
      balance: nayBalance,
      aye: false,
      conviction: 0
    });
  }

  return result;
}

function extractSplitAbstainVote(account: string, vote: any) {
  const splitAbstain = vote.asSplitAbstain;
  const ayeBalance = splitAbstain.aye.toBigInt().toString() as string;
  const nayBalance = splitAbstain.nay.toBigInt().toString() as string;
  const abstainBalance = splitAbstain.abstain.toBigInt().toString() as string;
  const common = {
    account,
    isDelegating: false,
    isSplitAbstain: true
  };

  const result = [
    objectSpread(
      { ...common }, {
      balance: abstainBalance,
      conviction: 0,
      isAbstain: true
    }
    )
  ];

  if (splitAbstain.aye.toBigInt() > 0) {
    result.push(objectSpread(
      { ...common }, {
      aye: true,
      balance: ayeBalance,
      conviction: 0
    })
    );
  }

  if (splitAbstain.nay.toBigInt() > 0) {
    result.push(objectSpread(
      { ...common }, {
      aye: false,
      balance: nayBalance,
      conviction: 0
    }));
  }

  return result;
}

function extractStandardVote(account, vote) {
  const standard = vote.asStandard;
  const balance = standard.balance.toBigInt().toString() as string;

  return [
    objectSpread(
      {
        account,
        isDelegating: false,
        isStandard: true
      },
      {
        balance,
        aye: standard.vote.isAye,
        conviction: standard.vote.conviction.toNumber()
      }
    )
  ];
}

function extractDelegations(
  mapped: {
    account: string;
    trackId: number;
    voting: any;
  }[],
  track: number,
  directVotes = []) {
  const delegations = mapped
    .filter(({ trackId, voting }) => voting.isDelegating && trackId === track)
    .map(({ account, voting }) => {
      return {
        account,
        delegating: voting.asDelegating
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
        conviction: conviction.toNumber()
      }
    ];
  }, []);
}

export type OnchainVotes = { ayes: VoterData[], nays: VoterData[], abstains: VoterData[] }

export async function getReferendumVotes(api: ApiPromise, trackId: number, referendumIndex: number): Promise<OnchainVotes | null> {
  return new Promise((resolve) => {
    if (!referendumIndex || !api) {
      console.log('referendumIndex is undefined getting Referendum Votes ');

      resolve(null);
    }

    api.query.convictionVoting.votingFor.entries().then((voting) => {
      const mapped = voting.map((item) => normalizeVotingOfEntry(item, api));

      const directVotes = extractVotes(mapped, referendumIndex);
      const delegationVotes = extractDelegations(mapped, trackId, directVotes);
      const sorted = sortVotesWithConviction([...directVotes, ...delegationVotes]);

      const ayes = sorted.filter((v) => !v.isAbstain && v.aye);
      const nays = sorted.filter((v) => !v.isAbstain && !v.aye);
      const abstains = sorted.filter((v) => v.isAbstain);

      resolve({ abstains, ayes, nays });
    }).catch(console.error);
  });
}
