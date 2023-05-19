// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { PalletConvictionVotingVoteCasting, PalletConvictionVotingVoteVoting, PalletReferendaReferendumInfoConvictionVotingTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { useEffect, useMemo, useState } from 'react';

import { BN_MAX_INTEGER } from '@polkadot/util';

import { CONVICTIONS } from '../popup/governance/utils/consts';
import useApi from './useApi';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useFormatted from './useFormatted';

export interface Lock {
  classId: BN;
  endBlock: BN;
  locked: string;
  refId: BN;
  total: BN;
}

export type PalletReferenda = 'referenda' | 'rankedPolls' | 'fellowshipReferenda';
export type PalletVote = 'convictionVoting' | 'rankedCollective' | 'fellowshipCollective';

function getLocks(api: ApiPromise, palletVote: PalletVote, votes: [classId: BN, refIds: BN[], casting: PalletConvictionVotingVoteCasting][], referenda: [BN, PalletReferendaReferendumInfoConvictionVotingTally][]): Lock[] {
  const lockPeriod = api.consts[palletVote].voteLockingPeriod as unknown as BN;
  const locks: Lock[] = [];

  for (let i = 0; i < votes.length; i++) {
    const [classId, , casting] = votes[i];

    for (let i = 0; i < casting.votes.length; i++) {
      const [refId, accountVote] = casting.votes[i];
      const refInfo = referenda.find(([id]) => id.eq(refId));

      if (refInfo) {
        const [, tally] = refInfo;
        let total: BN | undefined;
        let endBlock: BN | undefined;
        let convictionIndex = 0;
        let locked = 'None';

        if (accountVote.isStandard) {
          const { balance, vote } = accountVote.asStandard;

          total = balance;

          if ((tally.isApproved && vote.isAye) || (tally.isRejected && vote.isNay)) {
            convictionIndex = vote.conviction.index;
            locked = vote.conviction.type;
          }
        } else if (accountVote.isSplit) {
          const { aye, nay } = accountVote.asSplit;

          total = aye.add(nay);
        } else if (accountVote.isSplitAbstain) {
          const { abstain, aye, nay } = accountVote.asSplitAbstain;

          total = aye.add(nay).add(abstain);
        } else {
          console.error(`Unable to handle ${accountVote.type}`);
        }

        if (tally.isOngoing) {
          endBlock = BN_MAX_INTEGER;
        } else if (tally.isKilled) {
          endBlock = tally.asKilled;
        } else if (tally.isCancelled || tally.isTimedOut) {
          endBlock = tally.isCancelled
            ? tally.asCancelled[0]
            : tally.asTimedOut[0];
        } else if (tally.isApproved || tally.isRejected) {
          endBlock = lockPeriod
            .muln(convictionIndex ? CONVICTIONS[convictionIndex - 1][1] : 0)
            .add(
              tally.isApproved
                ? tally.asApproved[0]
                : tally.asRejected[0]
            );
        } else {
          console.error(`Unable to handle ${tally.type}`);
        }

        if (total && endBlock) {
          locks.push({ classId, endBlock, locked, refId, total });
        }
      }
    }
  }

  return locks;
}

export default function useAccountLocks(address: string | undefined, palletReferenda: PalletReferenda, palletVote: PalletVote, notExpired?: boolean): Lock[] | undefined | null {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [referenda, setReferenda] = useState<[BN, PalletReferendaReferendumInfoConvictionVotingTally][] | null>();
  const [votes, setVotes] = useState<[BN, BN[], PalletConvictionVotingVoteCasting][]>();

  useEffect(() => {
    getLockClass();

    async function getLockClass() {
      if (!api || !palletVote || !formatted) {
        return undefined;
      }

      const locks = await api.query[palletVote]?.classLocksFor(formatted) as unknown as [BN, BN][];
      const lockClasses = locks?.length
        ? locks.map((l) => l[0])
        : null;

      console.log('locksssssss:', JSON.parse(JSON.stringify(locks)));

      if (!lockClasses) {
        return setReferenda(null);
      }

      const voteParams: [string, BN][] = lockClasses.map((classId) => [String(formatted), classId]);

      const votingFor = await api.query[palletVote]?.votingFor.multi(voteParams) as unknown as PalletConvictionVotingVoteVoting[];

      console.log('votingFor:', JSON.parse(JSON.stringify(votingFor)));

      const votes = votingFor.map((v, index): null | [BN, BN[], PalletConvictionVotingVoteCasting] => {
        if (!v.isCasting) {
          return null;
        }

        const casting = v.asCasting;

        return [
          voteParams[index][1],
          casting.votes.map(([refId]) => refId),
          casting
        ];
      }).filter((v): v is [BN, BN[], PalletConvictionVotingVoteCasting] => !!v);

      setVotes(votes);

      let refIds: BN[] = [];

      if (votes && votes.length) {
        const ids = votes.reduce<BN[]>((all, [, ids]) => all.concat(ids), []);

        if (ids.length) {
          refIds = ids;
        }
      }

      if (!refIds.length) {
        return setReferenda(null);
      }

      const optTally = await api.query[palletReferenda]?.referendumInfoFor.multi(refIds) as unknown as PalletReferendaReferendumInfoRankedCollectiveTally[] | undefined;

      console.log('optTally:', optTally);
      const referenda = optTally
        ? optTally.map((v, index) =>
          v.isSome
            ? [refIds[index], v.unwrap() as PalletReferendaReferendumInfoConvictionVotingTally]
            : null
        ).filter((v): v is [BN, PalletReferendaReferendumInfoConvictionVotingTally] => !!v)
        : null;

      setReferenda(referenda);
    }
  }, [api, formatted, palletReferenda, palletVote]);

  return useMemo(() => {
    if (api && votes && referenda && currentBlock) {
      const accountLocks = getLocks(api, palletVote, votes, referenda);

      if (notExpired) {
        return accountLocks.filter((l) => l.endBlock.gtn(currentBlock));
      }

      return accountLocks;
    }

    if (referenda === null) {
      return null;
    }

    return undefined;
  }, [api, currentBlock, notExpired, palletVote, referenda, votes]);
}
