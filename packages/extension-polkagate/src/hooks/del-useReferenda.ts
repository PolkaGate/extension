// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletRankedCollectiveTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';

import { useEffect, useMemo, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { getReferendumPA, getReferendumSb } from '../popup/governance/utils/helpers';
import { Referendum, ReferendumPA, ReferendumSb } from '../popup/governance/utils/types';
import { useApi, useChainName } from '.';

export default function useReferenda(address: AccountId | string | undefined, type: 'referenda' | 'fellowship', id: number): Referendum | undefined {
  const chainName = useChainName(address);
  const api = useApi(address);

  const [referendum, setReferendum] = useState<Referendum | null>();
  const [referendumPA, setReferendumPA] = useState<ReferendumPA | null>();
  const [referendumSb, setReferendumSb] = useState<ReferendumSb | null>();
  const [onChainTally, setOnChainTally] = useState<PalletRankedCollectiveTally>();
  const [onChainVoteCounts, setOnChainVoteCounts] = useState<{ ayes: number | undefined, nays: number | undefined }>();
  const [VoteCountsPA, setVoteCountsPA] = useState<{ ayes: number | undefined, nays: number | undefined }>();

  const ayesAmount = useMemo(() => onChainTally?.ayes?.toString() || referendumSb?.ayes_amount || referendumPA?.tally?.ayes, [referendumPA, referendumSb, onChainTally]);
  const naysAmount = useMemo(() => onChainTally?.nays?.toString() || referendumSb?.nays_amount || referendumPA?.tally?.nays, [referendumPA, referendumSb, onChainTally]);
  const ayesCount = onChainVoteCounts?.ayes || VoteCountsPA?.ayes || referendumSb?.ayes_count;
  const naysCount = onChainVoteCounts?.nays || VoteCountsPA?.nays || referendumSb?.nays_count;

  useEffect(() => {
    api && id && api.query.referenda?.referendumInfoFor(id).then((res) => {
      const mayBeUnwrappedResult = (res.isSome && res.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;
      const mayBeOngoingRef = mayBeUnwrappedResult?.isOngoing && mayBeUnwrappedResult.asOngoing;
      const mayBeTally = mayBeOngoingRef ? mayBeOngoingRef.tally : undefined;

      setOnChainTally(mayBeTally);
    }).catch(console.error);
  }, [api, id]);

  useEffect(() => {
    if (!referendumPA && !referendumSb) {
      return;
    }

    setReferendum({
      index: Number(id),
      content: referendumPA?.content,
      created_at: referendumPA?.created_at,
      title: referendumPA?.title,
      trackId: (referendumSb?.origins_id || referendumPA?.track_number) && Number(referendumSb?.origins_id || referendumPA?.track_number),
      trackName: referendumSb?.origins || referendumPA?.origin,
      status: referendumPA?.status || referendumSb?.status,
      statusHistory: referendumPA?.statusHistory,
      timelineSb: referendumSb?.timeline,
      timelinePA: referendumPA?.timeline,
      supportAmount: referendumSb?.support_amount,
      type: referendumPA?.type,
      ayesAmount,
      naysAmount,
      ayesCount,
      naysCount,
      comments: referendumPA?.comments,
      proposer: referendumPA?.proposer,
      submissionAmount: referendumPA?.submitted_amount,
      decisionDepositAmount: referendumPA?.decision_deposit_amount,
      requestedFor: referendumPA?.proposed_call?.args?.amount,
      enactAfter: referendumPA?.enactment_after_block,
      method: referendumPA?.method,
      hash: referendumPA?.hash,
      call: referendumPA?.proposed_call,
      decisionDepositPayer: referendumSb?.decision_deposit_account?.address,
      statusHistory: referendumPA?.statusHistory,
      requested: referendumPA?.requested, // needs double check if is the same as requestedFor
    });
  }, [ayesAmount, ayesCount, id, naysAmount, naysCount, referendumPA, referendumSb]);

  useEffect(() => {
    if (!id || !chainName || !type) {
      return;
    }

    getReferendumPA(chainName, type, id).then((res) => {
      setReferendumPA(res);
    }).catch(console.error);

    getReferendumSb(chainName, type, id).then((res) => {
      setReferendumSb(res);
    }).catch(console.error);
  }, [chainName, id, type]);

  return referendum;
}
