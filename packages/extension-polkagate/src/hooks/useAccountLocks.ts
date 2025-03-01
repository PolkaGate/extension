// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/prefer-for-of */

import type { ApiPromise } from '@polkadot/api';
import type { Option, u32 } from '@polkadot/types';
// @ts-ignore
import type { PalletConvictionVotingVoteAccountVote, PalletConvictionVotingVoteCasting, PalletConvictionVotingVoteVoting, PalletReferendaReferendumInfoConvictionVotingTally } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types-codec/types';
import type { BN } from '@polkadot/util';

import { useEffect, useMemo, useState } from 'react';

import { BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import { CONVICTIONS } from '../fullscreen/governance/utils/consts';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import { useInfo } from '.';

export interface Lock {
  classId: BN;
  endBlock: BN;
  locked: string;
  refId: BN | 'N/A';
  total: BN;
}

export type PalletReferenda = 'referenda' | 'rankedPolls' | 'fellowshipReferenda';
export type PalletVote = 'convictionVoting' | 'rankedCollective' | 'fellowshipCollective';

function getLocks(api: ApiPromise, palletVote: PalletVote, votes: [classId: BN, refIds: BN[], casting: PalletConvictionVotingVoteCasting][], referenda: [BN, PalletReferendaReferendumInfoConvictionVotingTally][]): Lock[] {
  const lockPeriod = api.consts[palletVote]?.['voteLockingPeriod'] as unknown as BN;
  const locks: Lock[] = [];

  for (let i = 0; i < votes.length; i++) {
    const [classId, , casting] = votes[i];

    for (let j = 0; j < casting.votes.length; j++) {
      const [refId, accountVote] = casting.votes[j];
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
          }

          locked = vote.conviction.type;
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

interface Info {
  referenda: [BN, PalletReferendaReferendumInfoConvictionVotingTally][] | null,
  votes: [BN, BN[], PalletConvictionVotingVoteCasting][],
  priors: Lock[]
}

export default function useAccountLocks(address: string | undefined, palletReferenda: PalletReferenda, palletVote: PalletVote, notExpired?: boolean, refresh?: boolean): Lock[] | undefined | null {
  const { api, chain, formatted } = useInfo(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [info, setInfo] = useState<Info | null>();

  useEffect(() => {
    if (chain?.genesisHash && api && api.genesisHash.toString() !== chain.genesisHash) {
      return setInfo(undefined);
    }

    if (refresh) {
      setInfo(undefined);
    }

    async function getLockClass() {
      if (!api || !palletVote || !formatted) {
        return undefined;
      }

      setInfo(undefined);

      const locks = await api.query[palletVote]?.['classLocksFor'](formatted) as unknown as [BN, BN][];
      const lockClasses = locks?.length
        ? locks.map((l) => l[0])
        : null;

      if (!lockClasses) {
        return setInfo(null);
      }

      const params: [string, BN][] = lockClasses.map((classId) => [String(formatted), classId]);

      const maybeVotingFor = await api.query[palletVote]?.['votingFor'].multi(params) as unknown as PalletConvictionVotingVoteVoting[];

      if (!maybeVotingFor) {
        return; // has not voted!! or any issue
      }

      const maybePriors: Lock[] = [];

      const maybeVotes = maybeVotingFor.map((v, index): null | [BN, BN[], PalletConvictionVotingVoteCasting] => {
        if (!v.isCasting) {
          return null;
        }

        const casting = v.asCasting;
        const classId = params[index][1];

        if (!casting.prior[0].eq(BN_ZERO)) {
          maybePriors.push({
            classId,
            endBlock: casting.prior[0],
            locked: 'None',
            refId: 'N/A',
            total: casting.prior[1]
          });
        }

        return [
          classId,
          casting.votes.map(([refId]: ITuple<[u32, PalletConvictionVotingVoteAccountVote]>) => refId),
          casting
        ];
      }).filter((v): v is [BN, BN[], PalletConvictionVotingVoteCasting] => !!v);

      let refIds: BN[] = [];

      if (maybeVotes?.length) {
        const ids = maybeVotes.reduce<BN[]>((all, [, ids]) => all.concat(ids), []);

        if (ids.length) {
          refIds = ids;
        }
      }

      if (!refIds.length) {
        return setInfo({
          priors: maybePriors,
          referenda: null,
          votes: maybeVotes
        });
      }

      const optTallies = await api.query[palletReferenda]?.['referendumInfoFor'].multi(refIds) as unknown as Option<PalletReferendaReferendumInfoConvictionVotingTally>[] | undefined;

      const maybeReferenda = optTallies
        ? optTallies.map((v, index) =>
          v.isSome
            ? [refIds[index], v.unwrap()] as [BN, PalletReferendaReferendumInfoConvictionVotingTally]
            : null
        ).filter((v) => !!v)
        : null;

      setInfo({
        priors: maybePriors,
        referenda: maybeReferenda,
        votes: maybeVotes
      });
    }

    getLockClass().catch(console.error);
  }, [api, chain?.genesisHash, formatted, palletReferenda, palletVote, refresh]);

  return useMemo(() => {
    if (api && chain?.genesisHash && api.genesisHash.toString() === chain.genesisHash && info && currentBlock) {
      const { priors, referenda, votes } = info;
      const accountLocks = votes && referenda ? getLocks(api, palletVote, votes, referenda) : [];

      // /** add priors */
      accountLocks.push(...priors);

      return notExpired ? accountLocks.filter((l) => l.endBlock.gtn(currentBlock)) : accountLocks;
    }

    if (info === null) {
      return null;
    }

    return undefined;
  }, [api, chain?.genesisHash, info, currentBlock, palletVote, notExpired]);
}
