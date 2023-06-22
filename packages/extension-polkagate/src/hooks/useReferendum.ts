// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletRankedCollectiveTally, PalletReferendaReferendumInfoRankedCollectiveTally } from '@polkadot/types/lookup';
import type { u32 } from '@polkadot/types-codec';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { REFERENDA_LIMIT_SAVED_LOCAL } from '../popup/governance/utils/consts';
import { getReferendumVotes, OnchainVotes } from '../popup/governance/utils/getAllVotes';
import { getReferendumPA, getReferendumSb, isFinished } from '../popup/governance/utils/helpers';
import { Referendum, ReferendumHistory, ReferendumPA, ReferendumSb } from '../popup/governance/utils/types';
import { useApi, useChainName } from '.';

type ReferendumData = {
  [key: string]: Referendum[];
};

const isAlreadySaved = (list: Referendum[], referendum: Referendum) => list?.find((r) => r?.index === referendum?.index)

export default function useReferendum(address: AccountId | string | undefined, type: 'referenda' | 'fellowship', id: number, refresh?: boolean, getOnChain?: boolean, hasEnded?: boolean): Referendum | undefined {
  const chainName = useChainName(address);
  const api = useApi(address);

  const [referendum, setReferendum] = useState<Referendum>();
  const [savedReferendum, setSavedReferendum] = useState<Referendum>();
  const [referendumPA, setReferendumPA] = useState<ReferendumPA | null>();
  const [referendumSb, setReferendumSb] = useState<ReferendumSb | null>();
  const [onChainTally, setOnChainTally] = useState<PalletRankedCollectiveTally>();
  const [onchainVotes, setOnchainVotes] = useState<OnchainVotes | null>();
  const [onchainRefInfo, setOnchainRefInfo] = useState<PalletReferendaReferendumInfoRankedCollectiveTally | undefined>();
  const [notInLocalStorage, setNotInLocalStorage] = useState<boolean>();
  const [createdAtOC, setCreatedAtOC] = useState<number>(); // OC stands for On Chain ;)
  const [mayOriginOC, setMaybeOriginDC] = useState<string>();
  const [statusOC, setStatusOC] = useState<ReferendumHistory[]>();

  const ayesAmount = useMemo(() => onChainTally?.ayes?.toString() || referendumSb?.ayes_amount || referendumPA?.tally?.ayes, [referendumPA, referendumSb, onChainTally]);
  const naysAmount = useMemo(() => onChainTally?.nays?.toString() || referendumSb?.nays_amount || referendumPA?.tally?.nays, [referendumPA, referendumSb, onChainTally]);
  const ayesCount = onchainVotes?.ayes?.length || referendumSb?.ayes_count;
  const naysCount = onchainVotes?.nays?.length || referendumSb?.nays_count;

  const trackId = referendum?.trackId || (onchainRefInfo?.isOngoing ? onchainRefInfo?.asOngoing?.track?.toNumber() : undefined);
  const onChainStatus = (onchainRefInfo?.isOngoing
    ? (onchainRefInfo.asOngoing.deciding.isNone && 'Submitted') ||
    (onchainRefInfo.asOngoing.deciding.value.confirming.isNone && 'Deciding') ||
    (onchainRefInfo.asOngoing.deciding.value.confirming.isSome && 'ConfirmStarted')
    : undefined) ||
    (onchainRefInfo?.isApproved && 'Executed') ||
    (onchainRefInfo?.isCancelled && 'Cancelled') ||
    (onchainRefInfo?.isRejected && 'Rejected') ||
    (onchainRefInfo?.isTimedOut && 'TimedOut') ||
    (onchainRefInfo?.isKilled && 'Killed');

  const proposerOC = onchainRefInfo?.isOngoing
    ? onchainRefInfo.asOngoing.submissionDeposit.who.toString()
    : onchainRefInfo?.isApproved
      ? onchainRefInfo.asApproved[1].isSome ? onchainRefInfo.asApproved[1].value.who.toString() : undefined
      : onchainRefInfo?.isRejected
        ? onchainRefInfo.asRejected[1].isSome ? onchainRefInfo.asRejected[1].value.who.toString() : undefined
        : onchainRefInfo?.isCancelled
          ? onchainRefInfo.asCancelled[1].isSome ? onchainRefInfo.asCancelled[1].value.who.toString() : undefined
          : onchainRefInfo?.isTimedOut
            ? onchainRefInfo.asTimedOut[1].isSome ? onchainRefInfo.asTimedOut[1].value.who.toString() : undefined
            : undefined;

  const submissionAmountOC = onchainRefInfo?.isOngoing
    ? onchainRefInfo.asOngoing.submissionDeposit.amount.toString()
    : onchainRefInfo?.isApproved
      ? onchainRefInfo.asApproved[1].isSome ? onchainRefInfo.asApproved[1].value.amount.toString() : undefined
      : onchainRefInfo?.isRejected
        ? onchainRefInfo.asRejected[1].isSome ? onchainRefInfo.asRejected[1].value.amount.toString() : undefined
        : onchainRefInfo?.isCancelled
          ? onchainRefInfo.asCancelled[1].isSome ? onchainRefInfo.asCancelled[1].value.amount.toString() : undefined
          : onchainRefInfo?.isTimedOut
            ? onchainRefInfo.asTimedOut[1].isSome ? onchainRefInfo.asTimedOut[1].value.amount.toString() : undefined
            : undefined;

  const timeLineOC = useMemo(() => onchainRefInfo?.isOngoing
    ? [
      onchainRefInfo.asOngoing.submitted.toNumber(),
      onchainRefInfo.asOngoing.deciding.isSome && onchainRefInfo.asOngoing.deciding.value.since ? onchainRefInfo.asOngoing.deciding.value.since.toNumber() : undefined,
      onchainRefInfo.asOngoing.deciding.isSome && onchainRefInfo.asOngoing.deciding.value.confirming.isSome && onchainRefInfo.asOngoing.deciding.value.confirming ? onchainRefInfo.asOngoing.deciding.value.confirming.value.toNumber() : undefined
    ]
    : undefined
    , [onchainRefInfo]);

  const convertBlockNumberToDate = useCallback(async (blockNumber: u32 | number): Promise<number | undefined> => {
    if (!api) {
      return;
    }

    try {
      const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
      const { block } = await api.rpc.chain.getBlock(blockHash);

      const timestamp = block.extrinsics[0] && block.extrinsics[0].method.args[0] ? block.extrinsics[0].method.args[0].toNumber() as number : undefined;

      return timestamp;
    } catch (error) {
      console.error('Error:', error);
    }
  }, [api]);

  useEffect(() => {
    const makeStatus = async () => {
      if (!timeLineOC?.length) {
        return;
      }

      try {
        const temp = [];

        if (timeLineOC[0]) {
          const timestamp = await convertBlockNumberToDate(timeLineOC[0]);

          temp.push({
            block: timeLineOC[0],
            status: 'Submitted',
            timestamp
          });
        }

        if (timeLineOC[1]) {
          const timestamp = await convertBlockNumberToDate(timeLineOC[1]);

          temp.push({
            block: timeLineOC[1],
            status: 'Deciding',
            timestamp
          });
        }

        if (timeLineOC[2]) {
          const timestamp = await convertBlockNumberToDate(timeLineOC[2]);

          temp.push({
            block: timeLineOC[2],
            status: 'ConfirmStarted',
            timestamp
          });
        }

        setStatusOC(temp);
      } catch (error) {
        console.error(error);
      }
    };

    makeStatus();
  }, [convertBlockNumberToDate, timeLineOC]);

  useEffect(() => {
    api && id !== undefined && trackId !== undefined &&
      getReferendumVotes(api, trackId, id).then((votes) => {
        setOnchainVotes(votes);
        console.log('All votes from chain:', votes);
      });
  }, [api, id, trackId]);

  useEffect(() => {
    api && id !== undefined && api.query.referenda?.referendumInfoFor(id).then((res) => {
      const mayBeUnwrappedResult = (res.isSome && res.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;
      const mayBeOngoingRef = mayBeUnwrappedResult?.isOngoing ? mayBeUnwrappedResult?.asOngoing : undefined;
      const mayBeTally = mayBeOngoingRef ? mayBeOngoingRef.tally : undefined;

      // console.log('referendum Info for:', JSON.parse(JSON.stringify(mayBeUnwrappedResult)))

      setOnchainRefInfo(mayBeUnwrappedResult);
      setOnChainTally(mayBeTally);

      const mayBeOrigin = mayBeUnwrappedResult?.isOngoing ? JSON.parse(JSON.stringify(mayBeUnwrappedResult?.asOngoing?.origin)) : undefined;

      setMaybeOriginDC(mayBeOrigin && mayBeOrigin?.origins);
    }).catch(console.error);
  }, [api, id, refresh]);

  useEffect(() => {
    if (onchainRefInfo?.isOngoing) {
      onchainRefInfo.asOngoing.submitted && convertBlockNumberToDate(onchainRefInfo.asOngoing.submitted)
        .then(setCreatedAtOC);
    }
  }, [convertBlockNumberToDate, onchainRefInfo]);

  useEffect(() => {
    // if (!referendumPA && !referendumSb) {
    //   return;
    // }

    if (savedReferendum) {
      return;
    }

    setReferendum({
      ayesAmount,
      ayesCount,
      call: referendumPA?.proposed_call || referendumSb?.pre_image,
      chainName: referendumPA?.chainName || referendumSb?.chainName || chainName,
      comments: referendumPA?.comments,
      content: referendumPA?.content,
      created_at: referendumPA?.created_at || (referendumSb?.created_block_timestamp && referendumSb.created_block_timestamp * 1000) || createdAtOC,
      decisionDepositAmount: referendumPA?.decision_deposit_amount || referendumSb?.decision_deposit_balance ||
        (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.decisionDeposit.value.amount && onchainRefInfo.asOngoing.decisionDeposit.value.amount.toString() : undefined),
      decisionDepositPayer: referendumSb?.decision_deposit_account?.address || (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.decisionDeposit.value.who && onchainRefInfo.asOngoing.decisionDeposit.value.who.toString() : undefined),
      enactAfter: referendumPA?.enactment_after_block ||
        (onchainRefInfo?.isOngoing
          ? onchainRefInfo.asOngoing.enactment.isAfter
            ? onchainRefInfo.asOngoing.enactment.asAfter.toNumber()
            : onchainRefInfo.asOngoing.enactment.isAt
              ? onchainRefInfo.asOngoing.enactment.asAt.toNumber()
              : undefined
          : undefined),
      hash: referendumPA?.hash || (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.proposal.hash.toString() : undefined),
      index: Number(id),
      method: referendumPA?.method || referendumSb?.pre_image?.call_name,
      naysAmount,
      naysCount,
      proposer: referendumPA?.proposer || referendumSb?.account?.address || proposerOC,
      requested: referendumPA?.requested || referendumSb?.beneficiary_amount, // needs double check if is the same as requestedFor
      // requestedFor: referendumPA?.proposed_call?.args?.amount,
      status: referendumPA?.status || referendumSb?.status || onChainStatus,
      statusHistory: referendumPA?.statusHistory || referendumSb?.timeline || statusOC,
      submissionAmount: referendumPA?.submitted_amount || referendumSb?.pre_image?.amount || submissionAmountOC,
      submissionBlockOC: onchainRefInfo?.isOngoing
        ? onchainRefInfo.asOngoing.submitted.toNumber()
        : onchainRefInfo?.isApproved
          ? onchainRefInfo.asApproved[0].toNumber()
          : undefined,
      supportAmount: referendumSb?.support_amount || (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.tally?.support : undefined),
      timelinePA: referendumPA?.timeline,
      timelineSb: referendumSb?.timeline || statusOC,
      title: referendumPA?.title,
      trackId: ((referendumSb?.origins_id || referendumPA?.track_number) && Number(referendumSb?.origins_id || referendumPA?.track_number)) || trackId,
      trackName: referendumSb?.origins || referendumPA?.origin || mayOriginOC,
      type: referendumPA?.type
    });
  }, [ayesAmount, ayesCount, chainName, convertBlockNumberToDate, id, createdAtOC, mayOriginOC, naysAmount, naysCount, onChainStatus, onchainRefInfo, proposerOC, referendumPA, referendumSb, submissionAmountOC, trackId, statusOC, savedReferendum]);

  useEffect(() => {
    if (id === undefined || !chainName || !type || !notInLocalStorage) {
      return;
    }

    if (getOnChain && !hasEnded) {
      return;
    }

    if (notInLocalStorage) {
      getReferendumPA(chainName, type, id).then((res) => {
        setReferendumPA(res);
      }).catch(console.error);

      getReferendumSb(chainName, type, id).then((res) => {
        setReferendumSb(res);
      }).catch(console.error);
    }
  }, [chainName, getOnChain, hasEnded, id, notInLocalStorage, type]);

  useEffect(() => {
    if (!referendum?.timelinePA || !chainName || referendum.chainName !== chainName) {
      return;
    }

    if (!isFinished(referendum)) { // Do not save active referenda
      return;
    }

    /** to save the finished referendum in the local storage*/
    chrome.storage.local.get('latestFinishedReferendums8', (res) => {
      const k = `${chainName}`;
      const last = (res?.latestFinishedReferendums8 as ReferendumData) ?? {};

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
      void chrome.storage.local.set({ latestFinishedReferendums8: last });
    });
  }, [chainName, referendum]);

  useEffect(() => {
    /** look if the referendum id is already saved in local */
    chainName && chrome.storage.local.get('latestFinishedReferendums8', (res) => {
      const k = `${chainName}`;
      const last = (res?.latestFinishedReferendums8 as ReferendumData) ?? {};

      console.log('last[k]:', last[k]);

      if (!last[k]) {
        setNotInLocalStorage(true);

        return;
      }

      const arr = last[k];
      const found = arr.find((r) => r.index === id);

      if (found) {
        console.log(`retrieving ref ${found.index} FROM local`);

        return setSavedReferendum(found);
      }

      setNotInLocalStorage(true);
    });
  }, [chainName, id]);

  return savedReferendum || referendum;
}
