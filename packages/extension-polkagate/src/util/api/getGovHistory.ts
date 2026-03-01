// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */

import type { Extrinsics, ExtrinsicsRequest } from '../types';

import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

import { getSubscanChainName } from '../chain';
import { fetchFromSubscan } from '..';

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

export const nullObject = {
  code: 0,
  data: {
    count: 0,
    extrinsics: null
  },
  generated_at: Date.now(),
  message: 'Success'
} as unknown as ExtrinsicsRequest;

const MODULE = 'convictionvoting';
const PAGE_SIZE = 5;

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

  const network = getSubscanChainName(chainName) as unknown as string;

  const extrinsics = await fetchFromSubscan<ExtrinsicsRequest>(
    `https://${network}.api.subscan.io/api/v2/scan/extrinsics`,
    {
      address,
      module: MODULE,
      page: pageNum,
      row: PAGE_SIZE
    });

  if (!extrinsics.data.extrinsics) {
    return extrinsics;
  }

  // Fetch details for each extrinsic using fetchFromSubscan
  const extrinsicsInfo = await Promise.all(
    extrinsics.data.extrinsics.map(async(extrinsic) => {
      try {
        const functionName = extrinsic.call_module_function as keyof ParamTypesMapping;

        interface ResponseType {
          data: {
            params: ParamTypesMapping[typeof functionName];
            transfer: { amount: string; from: string; to: string; };
          };
        }

        const txDetail = await fetchFromSubscan<ResponseType>(
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

  return {
    ...extrinsics,
    data: {
      ...extrinsics.data,
      extrinsics: extrinsicsInfo
    }
  };
}

function getAdditionalInfo(functionName: keyof ParamTypesMapping, txDetail: { data: { params: ParamTypesMapping[typeof functionName]; } }, prefix: number) {
  const id = (txDetail.data.params[1]?.value as AccountId)?.Id as string | undefined;
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