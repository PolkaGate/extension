// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { Option, u32, u64 } from '@polkadot/types';
import type { AssetMetadata } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
// @ts-ignore
import type { PalletConvictionVotingTally, PalletReferendaReferendumInfoConvictionVotingTally } from '@polkadot/types/lookup';
import type { OnchainVotes } from '../fullscreen/governance/utils/getAllVotes';
import type { CommentType, Referendum, ReferendumHistory, ReferendumPA, ReferendumSb, TopMenu } from '../fullscreen/governance/utils/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { REFERENDA_LIMIT_SAVED_LOCAL } from '../fullscreen/governance/utils/consts';
import { getReferendumVotes } from '../fullscreen/governance/utils/getAllVotes';
import { getReferendumCommentsSS, getReferendumPA, getReferendumSb, isFinished } from '../fullscreen/governance/utils/helpers';
import { STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH } from '../util/constants';
import { isHexToBn } from '../util/utils';
import { useApi, useApiWithChain2, useChainName } from '.';

type ReferendumData = Record<string, Referendum[]>;

const isAlreadySaved = (list: Referendum[], referendum: Referendum) => list?.find((r) => r?.index === referendum?.index);

export const getAssetHubByChainName = (chainName?: string) => {
  if (chainName?.toLowerCase()?.includes('polkadot')) {
    return { genesisHash: STATEMINT_GENESIS_HASH, name: 'Polkadot Asset Hub' };
  }

  if (chainName?.toLowerCase()?.includes('kusama')) {
    return { genesisHash: STATEMINE_GENESIS_HASH, name: 'Kusama Asset Hub' };
  }

  return undefined;
};

export default function useReferendum(address: AccountId | string | undefined, type: TopMenu | undefined, id: number | undefined, refresh?: boolean, getOnChain?: boolean, isConcluded?: boolean, withoutOnChainVoteCounts = false): Referendum | undefined {
  const chainName = useChainName(address);
  const api = useApi(address);
  const assetHubApi = useApiWithChain2(getAssetHubByChainName(chainName) as Chain);

  const [referendum, setReferendum] = useState<Referendum>();
  const [savedReferendum, setSavedReferendum] = useState<Referendum>();
  const [referendumPA, setReferendumPA] = useState<ReferendumPA | null>();
  const [referendumSb, setReferendumSb] = useState<ReferendumSb | null>();
  const [referendumCommentsSS, setReferendumCommentsSS] = useState<CommentType[] | null>();
  const [onChainTally, setOnChainTally] = useState<PalletConvictionVotingTally>();
  const [onchainVotes, setOnchainVotes] = useState<OnchainVotes | null>();
  const [onchainRefInfo, setOnchainRefInfo] = useState<PalletReferendaReferendumInfoConvictionVotingTally | undefined>();
  const [notInLocalStorage, setNotInLocalStorage] = useState<boolean>();
  const [createdAtOC, setCreatedAtOC] = useState<number>(); // OC stands for On Chain ;)
  const [mayOriginOC, setMaybeOriginDC] = useState<string>();
  const [statusOC, setStatusOC] = useState<ReferendumHistory[]>();
  const [assetMetadata, setAssetMetadata] = useState<AssetMetadata | null>(null);

  const ayesAmount = useMemo(() => {
    const maybeAyes = onChainTally?.ayes?.toString() || referendumSb?.ayes_amount || referendumPA?.tally?.ayes;

    if (maybeAyes) {
      return isHexToBn(maybeAyes).toString();
    }

    return undefined;
  }, [referendumPA, referendumSb, onChainTally]);
  const naysAmount = useMemo(() => {
    const maybeNays = onChainTally?.nays?.toString() || referendumSb?.nays_amount || referendumPA?.tally?.nays;

    if (maybeNays) {
      return isHexToBn(maybeNays).toString();
    }

    return undefined;
  }, [referendumPA, referendumSb, onChainTally]);
  const ayesCount = onchainVotes?.ayes?.length || referendumSb?.ayes_count;
  const naysCount = onchainVotes?.nays?.length || referendumSb?.nays_count;

  const trackId = referendum?.trackId || (onchainRefInfo?.isOngoing ? onchainRefInfo?.asOngoing?.track?.toNumber() : undefined);
  const onChainStatus = useMemo(() => {
    if (onchainRefInfo?.isOngoing) {
      const deciding = onchainRefInfo.asOngoing.deciding;

      if (deciding.isNone) {
        return 'Submitted';
      }

      if (deciding.value.confirming.isNone) {
        return 'Deciding';
      }

      if (deciding.value.confirming.isSome) {
        return 'ConfirmStarted';
      }
    }

    if (onchainRefInfo?.isApproved) {
      return 'Executed';
    }

    if (onchainRefInfo?.isCancelled) {
      return 'Cancelled';
    }

    if (onchainRefInfo?.isRejected) {
      return 'Rejected';
    }

    if (onchainRefInfo?.isTimedOut) {
      return 'TimedOut';
    }

    if (onchainRefInfo?.isKilled) {
      return 'Killed';
    }

    return undefined;
  }, [onchainRefInfo]);

  const proposerOC = useMemo(() => onchainRefInfo?.isOngoing
    ? onchainRefInfo.asOngoing.submissionDeposit.who.toString()
    : onchainRefInfo?.isApproved
      ? onchainRefInfo.asApproved[1].isSome ? onchainRefInfo.asApproved[1].value.who.toString() : undefined
      : onchainRefInfo?.isRejected
        ? onchainRefInfo.asRejected[1].isSome ? onchainRefInfo.asRejected[1].value.who.toString() : undefined
        : onchainRefInfo?.isCancelled
          ? onchainRefInfo.asCancelled[1].isSome ? onchainRefInfo.asCancelled[1].value.who.toString() : undefined
          : onchainRefInfo?.isTimedOut
            ? onchainRefInfo.asTimedOut[1].isSome ? onchainRefInfo.asTimedOut[1].value.who.toString() : undefined
            : undefined
    , [onchainRefInfo]);

  const submissionAmountOC = useMemo(() => onchainRefInfo?.isOngoing
    ? onchainRefInfo.asOngoing.submissionDeposit.amount.toString()
    : onchainRefInfo?.isApproved
      ? onchainRefInfo.asApproved[1].isSome ? onchainRefInfo.asApproved[1].value.amount.toString() : undefined
      : onchainRefInfo?.isRejected
        ? onchainRefInfo.asRejected[1].isSome ? onchainRefInfo.asRejected[1].value.amount.toString() : undefined
        : onchainRefInfo?.isCancelled
          ? onchainRefInfo.asCancelled[1].isSome ? onchainRefInfo.asCancelled[1].value.amount.toString() : undefined
          : onchainRefInfo?.isTimedOut
            ? onchainRefInfo.asTimedOut[1].isSome ? onchainRefInfo.asTimedOut[1].value.amount.toString() : undefined
            : undefined
    , [onchainRefInfo]);

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

      const firstExtrinsic = block.extrinsics[0];

      if (firstExtrinsic?.method && firstExtrinsic.method.args.length > 0) {
        const timestampArg = firstExtrinsic.method.args[0] as u64;

        const timestamp = typeof timestampArg.toNumber === 'function'
          ? timestampArg.toNumber()
          : undefined;

        return timestamp;
      }

      return undefined;
    } catch (error) {
      console.error('Error:', error);

      return undefined;
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

    timeLineOC?.length && makeStatus().catch(console.error);
  }, [convertBlockNumberToDate, timeLineOC]);

  useEffect(() => {
    api && id !== undefined && trackId !== undefined && !withoutOnChainVoteCounts &&
      getReferendumVotes(api, trackId, id)
        .then((votes) => {
          setOnchainVotes(votes);
        }).catch(console.error);
  }, [api, id, trackId, withoutOnChainVoteCounts]);

  useEffect(() => {
    api && id !== undefined && api.query?.['referenda']?.['referendumInfoFor'] && api.query['referenda']['referendumInfoFor'](id)
      .then((result) => {
        const res = result as Option<PalletReferendaReferendumInfoConvictionVotingTally>;
        const maybeUnwrappedResult = (res.isSome && res.unwrap()) as PalletReferendaReferendumInfoConvictionVotingTally | undefined;
        const maybeOngoingRef = maybeUnwrappedResult?.isOngoing ? maybeUnwrappedResult?.asOngoing : undefined;
        const maybeTally = maybeOngoingRef ? maybeOngoingRef.tally : undefined;

        setOnchainRefInfo(maybeUnwrappedResult);
        setOnChainTally(maybeTally);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const maybeOrigin = maybeUnwrappedResult?.isOngoing ? JSON.parse(JSON.stringify(maybeUnwrappedResult?.asOngoing?.origin)) : undefined;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setMaybeOriginDC(maybeOrigin?.origins);
      }).catch(console.error);
  }, [api, id, refresh]);

  useEffect(() => {
    if (onchainRefInfo?.isOngoing) {
      onchainRefInfo.asOngoing.submitted && convertBlockNumberToDate(onchainRefInfo.asOngoing.submitted)
        .then(setCreatedAtOC)
        .catch(console.error);
    }
  }, [convertBlockNumberToDate, onchainRefInfo]);

  useEffect(() => {
    if (referendumPA?.assetId && assetHubApi?.query?.['assets']) {
      assetHubApi.query['assets']['metadata'](referendumPA.assetId)
        .then((assetMetadata) => {
          const metadata = assetMetadata as AssetMetadata;

          setAssetMetadata(metadata);
        }).catch(console.error);
    }
  }, [assetHubApi, referendumPA?.assetId]);

  useEffect(() => {
    if (savedReferendum) {
      return;
    }

    // Merge comments from referendumPA with referendumCommentsSS if available
    const comments = referendumCommentsSS
      ? referendumPA?.comments.map((commentPA) => {
        // Find a matching commentPA in referendumCommentsSS based on proposer or id
        const matchedComment = referendumCommentsSS.find(
          (commentSS) => commentSS.proposer === commentPA.proposer || commentSS.id === commentPA.id
        );

        // If no matching comment is found, return the original commentPA unchanged
        if (!matchedComment) {
          return commentPA;
        }

        // Determine which replies to use:
        // 1. Use original replies if they exist
        // 2. Otherwise, use matched comment replies if they exist
        // 3. If neither exists, use an empty array
        const mergedReplies = commentPA.replies.length > 0
          ? commentPA.replies
          : matchedComment.replies?.length > 0
            ? matchedComment.replies
            : [];

        // Merge the original commentPA with the matched comment:
        // - Spread the original commentPA properties
        // - Overwrite with matched comment properties
        // - Set the replies based on the mergedReplies logic
        return {
          ...commentPA,
          ...matchedComment,
          replies: mergedReplies
        };
      })
      : referendumPA?.comments; // If referendumCommentsSS doesn't exist, use referendumPA comments as is

    setReferendum({
      assetId: referendumPA?.assetId,
      ayesAmount,
      ayesCount,
      // @ts-expect-error comes from two different sources
      call: referendumPA?.proposed_call || referendumSb?.pre_image,
      chainName: referendumPA?.chainName || referendumSb?.chainName || chainName,
      comments,
      content: referendumPA?.content,
      created_at: referendumPA?.created_at || (referendumSb?.created_block_timestamp && referendumSb.created_block_timestamp * 1000) || createdAtOC,
      decimal: assetMetadata?.decimals?.toNumber(),
      decisionDepositAmount: referendumPA?.decision_deposit_amount || referendumSb?.decision_deposit_balance ||
        (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.decisionDeposit.value.amount?.toString() : undefined),
      decisionDepositPayer: referendumSb?.decision_deposit_account?.address || (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.decisionDeposit.value.who?.toString() : undefined),
      enactAfter: referendumPA?.enactment_after_block ||
        (onchainRefInfo?.isOngoing
          ? onchainRefInfo.asOngoing.enactment.isAfter
            ? onchainRefInfo.asOngoing.enactment.asAfter.toNumber()
            : undefined
          : undefined),
      enactAt: referendumPA?.enactment_at_block ||
        (onchainRefInfo?.isOngoing
          ? onchainRefInfo.asOngoing.enactment.isAt
            ? onchainRefInfo.asOngoing.enactment.asAt.toNumber()
            : undefined
          : undefined),
      hash: referendumPA?.hash || (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.proposal.hash.toString() : undefined),
      index: referendumPA?.post_id || referendumSb?.referendum_index || Number(id),
      method: referendumPA?.method || referendumSb?.pre_image?.call_name,
      naysAmount,
      naysCount,
      proposer: referendumPA?.proposer || referendumSb?.account?.address || proposerOC,
      requested: referendumPA?.requested || referendumSb?.beneficiary_amount, // needs double check if is the same as requestedFor
      status: referendumPA?.status || referendumSb?.status || onChainStatus,
      statusHistory: referendumPA?.statusHistory || referendumSb?.timeline || statusOC,
      submissionAmount: referendumPA?.submitted_amount || referendumSb?.pre_image?.amount || submissionAmountOC,
      submissionBlockOC: onchainRefInfo?.isOngoing
        ? onchainRefInfo.asOngoing.submitted.toNumber()
        : undefined,
      supportAmount: referendumSb?.support_amount || (onchainRefInfo?.isOngoing ? onchainRefInfo.asOngoing.tally?.support?.toString() : undefined),
      timelinePA: referendumPA?.timeline,
      timelineSb: referendumSb?.timeline || statusOC,
      title: referendumPA ? referendumPA.title ? referendumPA.title : null : undefined,
      token: assetMetadata?.symbol?.toHuman() as string,
      trackId: ((referendumSb?.origins_id || referendumPA?.track_number) && Number(referendumSb?.origins_id || referendumPA?.track_number)) || trackId,
      trackName: referendumSb?.origins || referendumPA?.origin || mayOriginOC,
      type: referendumPA?.type
    });
  }, [ayesAmount, assetMetadata, ayesCount, chainName, convertBlockNumberToDate, id, createdAtOC, mayOriginOC, naysAmount, naysCount, onChainStatus, onchainRefInfo, proposerOC, referendumPA, referendumSb, submissionAmountOC, trackId, statusOC, savedReferendum, referendumCommentsSS]);

  useEffect(() => {
    if (id === undefined || !chainName || !type || !notInLocalStorage) {
      return;
    }

    if (getOnChain && !isConcluded) {
      return;
    }

    if (notInLocalStorage) {
      getReferendumPA(chainName, type, id).then((res) => {
        setReferendumPA(res);
      }).catch(console.error);

      getReferendumSb(chainName, type, id).then((res) => {
        setReferendumSb(res);
      }).catch(console.error);

      getReferendumCommentsSS(chainName, id).then((res) => {
        setReferendumCommentsSS(res);
      }).catch(console.error);
    }
  }, [chainName, getOnChain, isConcluded, id, notInLocalStorage, type]);

  useEffect(() => {
    if (!referendumPA || !referendumSb || !referendum?.timelinePA || !chainName || referendum.chainName !== chainName) {
      return;
    }

    if (!isFinished(referendum)) { // Do not save active referenda
      return;
    }

    /** to save the finished referendum in the local storage*/
    chrome.storage.local.get('latestFinishedReferenda', (res) => {
      const k = `${chainName}`;
      const last = (res?.['latestFinishedReferenda'] as ReferendumData) ?? {};

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
      void chrome.storage.local.set({ latestFinishedReferenda: last });
    });
  }, [chainName, referendum, referendumPA, referendumSb]);

  useEffect(() => {
    /** look if the referendum id is already saved in local */
    chainName && chrome.storage.local.get('latestFinishedReferenda', (res) => {
      const k = `${chainName}`;
      const last = (res?.['latestFinishedReferenda'] as ReferendumData) ?? {};

      // console.log('last[k]:', last[k]);

      if (!last[k]) {
        setNotInLocalStorage(true);

        return;
      }

      const arr = last[k];
      const sanitizedType = type?.toLowerCase() === 'fellowship' ? 'FellowshipReferendum' : 'ReferendumV2';
      const found = arr.find((r) => r.index === id && r.type === sanitizedType);

      if (found) {
        // console.log(`retrieving ref ${found.index} FROM local`);

        return setSavedReferendum(found);
      }

      setNotInLocalStorage(true);
    });
  }, [chainName, id, type]);

  return savedReferendum || referendum;
}
