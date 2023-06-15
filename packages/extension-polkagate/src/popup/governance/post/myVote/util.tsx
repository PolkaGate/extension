// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import type { PalletConvictionVotingVoteVoting } from '@polkadot/types/lookup';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Track } from '../../../../hooks/useTrack';
import { toCamelCase } from '../../utils/util';

export const CONVICTION = {
  Locked1x: 1,
  Locked2x: 2,
  Locked3x: 3,
  Locked4x: 4,
  Locked5x: 5,
  Locked6x: 6,
  None: 0
};

const AYE_BITS = 0b10000000;
const CON_MASK = 0b01111111;

export const isAye = (vote: string) => (vote & AYE_BITS) === AYE_BITS;
export const getConviction = (vote: string) => (vote & CON_MASK) === 0 ? 0.1 : (vote & CON_MASK);

interface Votes {
  votes: [number, Vote][];
  delegations: {
    votes: number;
    capital: number;
  };
  prior?: [number, number];
}

export interface Vote {
  standard?: {
    vote: string;
    balance: number;
  };
  delegations?: {
    votes: number;
    capital: number;
  };
  splitAbstain?: {
    abstain: number;
    aye: number;
    nay: number;
  };
  delegating?: {
    balance: BN;
    aye?: boolean;
    nay?: boolean;
    abstain?: BN;
    conviction: number;
    target?: AccountId32;
    voted?: boolean;
  }
}

interface Voting {
  casting: Votes;
  delegating: any; // needs to be fixed
}

export async function getAddressVote(address: string, api: ApiPromise, referendumIndex: number, trackId: number): Promise<Vote | null> {
  const voting = await api.query.convictionVoting.votingFor(address, trackId) as unknown as PalletConvictionVotingVoteVoting;

  if (voting.isEmpty) {
    return null;
  }

  // For the direct vote, just return the vote.
  if (voting.isCasting) {
    const vote = voting.asCasting.votes.find((vote) => vote[0].toNumber() === referendumIndex)?.[1];

    return vote?.type
      ? {
        delegations: voting.asCasting.delegations,
        [toCamelCase(vote.type)]: (vote?.isStandard && vote?.asStandard) || (vote?.isSplitAbstain && vote?.asSplitAbstain) || (vote?.isSplit && vote?.asSplit)
      }
      : {
        delegations: voting.asCasting.delegations
      };
  }

  // If the address has delegated to other.
  if (voting.isDelegating) {
    // Then, look into the votes of the delegating target address.
    const { conviction, target } = voting.asDelegating;
    const proxyVoting = await api.query.convictionVoting.votingFor(target, trackId) as unknown as PalletConvictionVotingVoteVoting;
    const vote = proxyVoting.asCasting.votes.find(([index]) => index.toNumber() === referendumIndex)?.[1];

    if (!vote?.isStandard && !vote?.isSplitAbstain) {
      return {
        delegating: {
          ...voting.asDelegating,
          conviction: CONVICTION[conviction.type],
          voted: false
        }
      };
    }

    // If the delegating target address has standard vote on this referendum,
    // means this address has voted on this referendum.
    const aye = vote.isStandard && isAye(vote.asStandard.vote.toString());
    const abstain = vote.isSplitAbstain
      ? (
        vote.asSplitAbstain.abstain
          ? vote.asSplitAbstain.abstain
          : vote.asSplitAbstain.aye.add(vote.asSplitAbstain.nay)
      )
      : undefined;

    return {
      delegating: {
        abstain,
        aye,
        balance: voting.asDelegating.balance,
        conviction: CONVICTION[conviction.type],
        delegations: voting.asDelegating.delegations,
        prior: voting.asDelegating.prior,
        target: voting.asDelegating.target,
        voted: true
      }
    };
  }

  return null;
}

// export async function getAddressVote(address: string, api: ApiPromise, referendumIndex: number, trackId: number): Promise<Vote | null> {
//   const voting = await api.query.convictionVoting.votingFor(address, trackId);
//   const jsonVoting = voting?.toJSON() as unknown as Voting;

//   if (!jsonVoting) {
//     return null;
//   }

//   // For the direct vote, just return the vote.
//   if (jsonVoting.casting) {
//     const vote = jsonVoting.casting.votes?.find((vote) => vote[0] === referendumIndex)?.[1];

//     return {
//       ...vote,
//       delegations: jsonVoting.casting.delegations
//     };
//   }

//   // If the address has delegated to other.
//   if (jsonVoting.delegating) {
//     // Then, look into the votes of the delegating target address.
//     const { target, conviction } = jsonVoting.delegating;
//     const proxyVoting = await api.query.convictionVoting.votingFor(target, trackId);
//     const jsonProxyVoting = proxyVoting?.toJSON() as Voting;
//     const vote = jsonProxyVoting?.casting?.votes?.find(([index]) => index === referendumIndex)?.[1];

//     if (!vote?.standard && !vote?.splitAbstain) {

//       return {
//         delegating: {
//           ...jsonVoting.delegating,
//           conviction: CONVICTION[conviction],
//           voted: false
//         }
//       };
//     }

//     // If the delegating target address has standard vote on this referendum,
//     // means this address has voted on this referendum.
//     const aye = vote?.standard && isAye(vote.standard.vote);
//     const abstain = vote?.splitAbstain && (
//       vote.splitAbstain?.abstain
//         ? new BN(vote.splitAbstain.abstain)
//         : new BN(vote.splitAbstain.aye || 0).add(new BN(vote.splitAbstain.nay || 0)));

//     return {
//       delegating: {
//         ...jsonVoting.delegating,
//         abstain,
//         aye,
//         conviction: CONVICTION[conviction],
//         voted: true,
//       }
//     };
//   }

//   return null;
// }

export async function getAllVotes(address: string, api: ApiPromise, tracks: Track[]): Promise<number[] | null> {
  const queries = tracks.map((t) => api.query.convictionVoting.votingFor(address, t[0]));
  const voting = await Promise.all(queries);
  const castedRefIndexes = voting?.map((v => {
    const jsonV = v.toJSON() as unknown as Voting;

    return jsonV?.casting?.votes?.map((vote) => vote[0]);
  }));

  // if (jsonVoting.delegating) {
  //   // Then, look into the votes of the delegating target address.
  //   const { target, conviction } = jsonVoting.delegating;
  //   const proxyVoting = await api.query.convictionVoting.votingFor(target, trackId);
  //   const jsonProxyVoting = proxyVoting?.toJSON() as Voting;
  //   const vote = jsonProxyVoting?.casting?.votes?.find(([index]) => index === referendumIndex)?.[1];
  // }

  return castedRefIndexes.flat();
}
