// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */

import type { Extrinsics, ExtrinsicsRequest } from '../types';

import request from 'umi-request';

import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

// Common types
interface AccountId {
  Id: string;
}

interface StandardVote {
  balance: string;
  vote: number;
}

interface SplitAbstainVote {
  abstain: string;
  aye: string;
  nay: string;
}

// Parameter types for different convictionvoting actions
interface BaseParam<T> {
  value: T;
}

interface VotesType {
  Standard: StandardVote;
  SplitAbstain: SplitAbstainVote
}

type ClassOfParam = BaseParam<number>;

interface DelegateParams extends Array<BaseParam<unknown>> {
  0: ClassOfParam; // ClassOf
  1: BaseParam<AccountId>; // delegatee AccountId
  2: BaseParam<string>; // conviction Locked2x
  3: BaseParam<string>; // balance
}

interface UndelegateParams extends Array<BaseParam<unknown>> {
  0: ClassOfParam; // ClassOf
}

interface UnlockParams extends Array<BaseParam<unknown>> {
  0: ClassOfParam; // ClassOf
  1: BaseParam<AccountId>; // delegatee AccountId
}

interface VoteParams extends Array<BaseParam<unknown>> {
  0: BaseParam<number>; // PollIndexOf
  1: BaseParam<VotesType>;
}

interface RemoveVoteParams extends Array<BaseParam<unknown>> {
  0: ClassOfParam; // ClassOf
  1: BaseParam<number>; // PollIndexOf
}

// Function types
// Define a type for the param types mapping
interface ParamTypesMapping {
  delegate: DelegateParams;
  undelegate: UndelegateParams;
  vote: VoteParams;
  remove_vote: RemoveVoteParams;
  unlock: UnlockParams;
}

const nullObject = {
  code: 0,
  data: {
    count: 0,
    extrinsics: null
  },
  generated_at: Date.now(),
  message: 'Success'
} as unknown as ExtrinsicsRequest;

const MODULE = 'convictionvoting';
const RETRY_DELAY = 1100; // 1.1 second delay
const MAX_RETRIES = 7;
const BATCH_SIZE = 3;
const PAGE_SIZE = 12;

/**
 * Sleep function to create delays between retries
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enhanced POST request with retry logic for rate limiting
 */
async function postReq<T>(
  api: string,
  data: Record<string, unknown> = {},
  option?: Record<string, unknown>,
  retryCount = 0
): Promise<T> {
  try {
    const response = await request.post(api, { data, ...option }) as T;

    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Rate limit hit, retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);

      return postReq<T>(api, data, option, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Processes an array in batches
 * @param array Array to process
 * @param batchSize Size of each batch
 * @param processor Function to process each batch
 */
async function processBatch<T>(array: T[], batchSize: number, processor: (items: T[]) => Promise<T[]>): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await processor(batch);

    results.push(...batchResults);

    // Add delay between batches if not the last batch
    if (i + batchSize < array.length) {
      await sleep(RETRY_DELAY);
    }
  }

  return results;
}

/**
 * Process a batch of extrinsics
 */
async function processExtrinsicsBatch(extrinsics: Extrinsics[], network: string, prefix: number) {
  return Promise.all(
    extrinsics.map(async (extrinsic) => {
      try {
        const functionName = extrinsic.call_module_function as keyof ParamTypesMapping;

        interface ResponseType {
          data: {
            params: ParamTypesMapping[typeof functionName];
          };
        }

        const txDetail = await postReq<ResponseType>(
          `https://${network}.api.subscan.io/api/scan/extrinsic`,
          { hash: extrinsic.extrinsic_hash }
        );

        const additionalInfo = getAdditionalInfo(functionName, txDetail, prefix);

        return {
          ...extrinsic,
          ...additionalInfo
        } as Extrinsics;
      } catch (error) {
        console.error('Failed to fetch details for extrinsic:', error);

        return extrinsic;
      }
    })
  );
}

/**
 * Fetches governance history for a given address
 * @param chainName - Name of the blockchain
 * @param address - Account address
 * @param pageNum - Page number for pagination
 * @param prefix - chain prefix
 * @returns Promise resolving to ExtrinsicsRequest
 */
export async function getGovHistory(chainName: string, address: string, pageNum: number, prefix: number | undefined): Promise<ExtrinsicsRequest> {
  if (!chainName || prefix === undefined) {
    return Promise.resolve(nullObject);
  }

  const network = chainName.toLowerCase();

  const extrinsics = await postReq<ExtrinsicsRequest>(`https://${network}.api.subscan.io/api/v2/scan/extrinsics`, {
    address,
    module: MODULE,
    page: pageNum,
    row: PAGE_SIZE
  });

  if (!extrinsics.data.extrinsics) {
    return extrinsics;
  }

  // Process extrinsics in batches
  const extrinsicsInfo = await processBatch<Extrinsics>(
    extrinsics.data.extrinsics,
    BATCH_SIZE,
    (batch) => processExtrinsicsBatch(batch, network, prefix)
  );

  return {
    ...extrinsics,
    data: {
      ...extrinsics.data,
      extrinsics: extrinsicsInfo
    }
  };
}

function getAdditionalInfo(functionName: keyof ParamTypesMapping, txDetail: { data: { params: ParamTypesMapping[typeof functionName]; } }, prefix: number) {
  const id = (txDetail.data.params[1]?.value as AccountId).Id as string | undefined;
  const formattedAddress = id ? encodeAddress(hexToU8a(id), prefix) : undefined;

  const voteBalance = ((txDetail.data.params[1]?.value as VotesType)?.Standard?.balance ?? (txDetail.data.params[1]?.value as VotesType)?.SplitAbstain?.abstain) as string | undefined;
  const voteType = ((txDetail.data.params[1]?.value as VotesType)?.Standard?.vote ?? null) as number | null;

  switch (functionName) {
    case 'delegate':
      return {
        amount: txDetail.data.params[3]?.value as string | undefined,
        class: txDetail.data.params[0]?.value as number | undefined,
        conviction: txDetail.data.params[2]?.value as string | undefined,
        delegatee: formattedAddress
      };

    case 'undelegate':
      return {
        class: txDetail.data.params[0]?.value as number | undefined
      };

    case 'unlock':
      return {
        class: txDetail.data.params[0]?.value as number | undefined,
        from: formattedAddress
      };

    case 'vote':
      return {
        amount: voteBalance,
        refId: txDetail.data.params[0]?.value as number | undefined,
        voteType
      };

    case 'remove_vote':
      return {
        class: txDetail.data.params[0]?.value as number | undefined,
        refId: txDetail.data.params[1]?.value as number | undefined
      };

    default:
      return {};
  }
}
