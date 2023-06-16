// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletRankedCollectiveTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';

import { useEffect, useMemo, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { FINISHED_REFERENDUM_STATUSES, REFERENDA_LIMIT_SAVED_LOCAL } from '../popup/governance/utils/consts';
import { getReferendumPA, getReferendumSb } from '../popup/governance/utils/helpers';
import { Referendum, ReferendumPA, ReferendumSb } from '../popup/governance/utils/types';
import { useApi, useChainName } from '.';

type ReferendumData = {
  [key: string]: Referendum[];
};

const isFinished = (referendum: Referendum) => referendum?.status && FINISHED_REFERENDUM_STATUSES.includes(referendum.status);
const isAlreadySaved = (list: Referendum[], referendum: Referendum) => list?.find((r) => r?.index === referendum?.index)

export default function useReferendum(address: AccountId | string | undefined, type: 'referenda' | 'fellowship', id: number): Referendum | undefined {
  const chainName = useChainName(address);
  const api = useApi(address);

  const [referendum, setReferendum] = useState<Referendum>();
  const [referendumPA, setReferendumPA] = useState<ReferendumPA | null>();
  const [referendumSb, setReferendumSb] = useState<ReferendumSb | null>();
  const [onChainTally, setOnChainTally] = useState<PalletRankedCollectiveTally>();
  const [onChainVoteCounts, setOnChainVoteCounts] = useState<{ ayes: number | undefined, nays: number | undefined }>();
  const [VoteCountsPA, setVoteCountsPA] = useState<{ ayes: number | undefined, nays: number | undefined }>();
  const [notInLocalStorage, setNotInLocalStorage] = useState<boolean>();

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
      ayesAmount,
      ayesCount,
      call: referendumPA?.proposed_call || referendumSb?.pre_image,
      chainName: referendumPA?.chainName || referendumSb?.chainName,
      comments: referendumPA?.comments,
      content: referendumPA?.content,
      created_at: referendumPA?.created_at || (referendumSb?.created_block_timestamp && referendumSb.created_block_timestamp * 1000),
      decisionDepositAmount: referendumPA?.decision_deposit_amount || referendumSb?.decision_deposit_balance,
      decisionDepositPayer: referendumSb?.decision_deposit_account?.address,
      enactAfter: referendumPA?.enactment_after_block,
      hash: referendumPA?.hash,
      index: Number(id),
      method: referendumPA?.method || referendumSb?.pre_image?.call_name,
      naysAmount,
      naysCount,
      proposer: referendumPA?.proposer || referendumSb?.account?.address,
      requested: referendumPA?.requested || referendumSb?.beneficiary_amount, // needs double check if is the same as requestedFor
      // requestedFor: referendumPA?.proposed_call?.args?.amount,
      status: referendumPA?.status || referendumSb?.status,
      statusHistory: referendumPA?.statusHistory || referendumSb?.timeline,
      submissionAmount: referendumPA?.submitted_amount || referendumSb?.pre_image?.amount,
      supportAmount: referendumSb?.support_amount,
      timelinePA: referendumPA?.timeline,
      timelineSb: referendumSb?.timeline,
      title: referendumPA?.title,
      trackId: (referendumSb?.origins_id || referendumPA?.track_number) && Number(referendumSb?.origins_id || referendumPA?.track_number),
      trackName: referendumSb?.origins || referendumPA?.origin,
      type: referendumPA?.type
    });
  }, [ayesAmount, ayesCount, id, naysAmount, naysCount, referendumPA, referendumSb]);

  useEffect(() => {
    if (!id || !chainName || !type || !notInLocalStorage) {
      return;
    }

    getReferendumPA(chainName, type, id).then((res) => {
      setReferendumPA(res);
    }).catch(console.error);

    getReferendumSb(chainName, type, id).then((res) => {
      setReferendumSb(res);
    }).catch(console.error);
  }, [chainName, id, notInLocalStorage, type]);

  useEffect(() => {
    if (!referendum || !chainName || referendum.chainName !== chainName) {
      return;
    }

    if (!isFinished(referendum)) {
      return;
    }

    /** to save the finished referendum in the local storage*/
    chrome.storage.local.get('latestFinishedReferendums3', (res) => {
      const k = `${chainName}`;
      const last = (res?.latestFinishedReferendums3 as ReferendumData) ?? {};

      if (!last[k]) {
        last[k] = [referendum];
      } else {
        if (isAlreadySaved(last[k], referendum)) {
          return;
        }

        if (last[k].length >= REFERENDA_LIMIT_SAVED_LOCAL) {
          last[k].shift();
        }

        // console.log(`saving ref ${referendum.index} in local:`, referendum)
        last[k].push(referendum);
        last[k].sort((a, b) => a.index - b.index);
      }

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ latestFinishedReferendums3: last });
    });
  }, [chainName, referendum]);

  useEffect(() => {
    /** look if the referendum id is already saved in local */
    chainName && chrome.storage.local.get('latestFinishedReferendums3', (res) => {
      const k = `${chainName}`;
      const last = (res?.latestFinishedReferendums3 as ReferendumData) ?? {};

      // console.log('last[k]:', last[k]);

      if (!last[k]) {
        setNotInLocalStorage(true);

        return;
      }

      const arr = last[k];
      const found = arr.find((r) => r.index === id);

      if (found) {
        // console.log(`retrieving ref ${found.index} FROM local`);

        return setReferendum(found);
      }

      setNotInLocalStorage(true);
    });
  }, [chainName, id]);

  return referendum;
}
