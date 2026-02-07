// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
/* eslint-disable no-fallthrough */

import type { Extrinsics, ExtrinsicsRequest } from '../types';

import { keyMaker } from '@polkadot/extension-polkagate/src/popup/history/hookUtils/utils';
import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

import { getSubscanChainName } from '../chain';
import getChainName from '../getChainName';
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
  Standard?: StandardVote;
  SplitAbstain?: SplitAbstainVote
}

type ClassOfParam = BaseParam<number>;

interface CallsParam {
  call_module: string;
  call_name: string;
}

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
  0: ClassOfParam; // PollIndexOf
  1: BaseParam<VotesType>; // AccountVote
}

interface RemoveVoteParams extends Array<BaseParam<unknown>> {
  0: ClassOfParam; // ClassOf
  1: ClassOfParam; // PollIndexOf
}

interface BatchParams extends Array<BaseParam<unknown>> {
  0: BaseParam<CallsParam[]>; // TXs
}

interface ProxyParams extends Array<BaseParam<unknown>> {
  2: BaseParam<CallsParam>; // TX
}

interface NominateParams extends Array<BaseParam<unknown>> {
  0: BaseParam<AccountId[]>; // Nominators AccountId
}

interface UnbondParams extends Array<BaseParam<unknown>> {
  1: BaseParam<string>; // unbonded amount
}

interface JoinParams extends Array<BaseParam<unknown>> {
  0: BaseParam<string>; // unbonded amount
  1: BaseParam<string>; // pool ID
}

interface TransferParams extends Array<BaseParam<unknown>> {
  0: BaseParam<AccountId>; // Recipient ID
  1: BaseParam<string>; // unbonded amount
}

interface BondParam extends Array<BaseParam<unknown>> {
  0: BaseParam<string>; // bond amount
}

interface BondExtraFreeBalance { FreeBalance: string }
interface BondExtraRewards { Rewards: string | null }
interface BondExtraParam extends Array<BaseParam<unknown>> {
  0: BaseParam<string | BondExtraFreeBalance | BondExtraRewards>; // bondExtra amount
}

interface TransferAllParams extends Array<BaseParam<unknown>> {
  0: BaseParam<AccountId>; // Recipient ID
}

// Function types
// Define a type for the param types mapping
interface ParamTypesMapping {
  // ConvictionVoting
  delegate: DelegateParams;
  undelegate: UndelegateParams;
  vote: VoteParams;
  remove_vote: RemoveVoteParams;
  unlock: UnlockParams;

  // Proxy
  proxy: ProxyParams;

  // Staking / NominationPools
  rebond: UnbondParams;
  unbond: UnbondParams;
  nominate: NominateParams;
  bond_extra: BondExtraParam;
  join: JoinParams;
  bond: BondParam;

  // Balances
  transfer_all: TransferAllParams;
  transfer_keep_alive: TransferParams;
  transfer_allow_death: TransferParams;
  transfer: TransferParams;

  // Utility
  batch_all: BatchParams;
  force_batch: BatchParams;
  batch: BatchParams;
}

const SUPPORTED_MODULES = ['balances', 'nominationpools', 'utility', 'proxy', 'staking', 'convictionvoting'];
const PAGE_SIZE = 60;

function nullifier(requested: string) {
  return {
    code: 0,
    data: {
      count: 0,
      extrinsics: null
    },
    for: requested,
    generated_at: Date.now(),
    message: 'Success'
  } as unknown as ExtrinsicsRequest;
}

/**
 * Fetches TXs history for a given address on a given chainName
 * @param address - Account address
 * @param genesisHash - genesis hash of the blockchain
 * @param pageNum - Page number for pagination
 * @param prefix - chain prefix
 * @returns Promise resolving to ExtrinsicsRequest
 */
export async function getTXsHistory(address: string, genesisHash: string, pageNum: number, prefix: number | undefined): Promise<ExtrinsicsRequest> {
  const requested = keyMaker(address, genesisHash);

  if (prefix === undefined) {
    return Promise.resolve(nullifier(requested));
  }

  const chainName = getChainName(genesisHash);
  const network = getSubscanChainName(chainName) as unknown as string;

  const extrinsics = await fetchFromSubscan<ExtrinsicsRequest>(`https://${network}.api.subscan.io/api/v2/scan/extrinsics`, {
    address,
    page: pageNum,
    row: PAGE_SIZE
  });

  if (!extrinsics.data.extrinsics) {
    return nullifier(requested);
  }

  const filteredModules = extrinsics.data.extrinsics.filter((extrinsic) => SUPPORTED_MODULES.includes(extrinsic.call_module));

  // Fetch details for each extrinsic using fetchFromSubscan
  const extrinsicsInfo = await Promise.all(
    filteredModules.map(async(extrinsic) => {
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

  for (const item of (extrinsicsInfo || [])) {
    item.forAccount = address;
  }

  return {
    ...extrinsics,
    data: {
      ...extrinsics.data,
      count: extrinsics.data.count,
      extrinsics: extrinsicsInfo
    },
    for: requested
  };
}

function getAdditionalInfo(functionName: keyof ParamTypesMapping, txDetail: { data: { params: ParamTypesMapping[typeof functionName]; transfer: { amount: string; from: string; to: string; } } }, prefix: number) {
  try {
    const params = txDetail.data.params;
    const transfer = txDetail.data?.transfer;
    const id = (params?.[1]?.value as AccountId)?.Id as string | undefined;
    const formattedAddress = id ? encodeAddress(hexToU8a(id), prefix) : undefined;

    switch (functionName) {
      case 'delegate':
        return {
          amount: params?.[3]?.value as string | undefined,
          class: params?.[0]?.value,
          conviction: params?.[2]?.value as string | undefined,
          delegatee: formattedAddress
        };

      case 'undelegate':
        return {
          class: params?.[0]?.value
        };

      case 'unlock':
        return {
          class: params?.[0]?.value,
          from: formattedAddress
        };

      case 'vote':
        {
          const voteBalance = ((params?.[1]?.value as VotesType)?.Standard?.balance ?? (params?.[1]?.value as VotesType)?.SplitAbstain?.abstain);
          const voteType = ((params?.[1]?.value as VotesType)?.Standard?.vote ?? null);

          return {
            amount: voteBalance,
            refId: params?.[0]?.value,
            voteType
          };
        }

      case 'remove_vote':
        return {
          class: params?.[0]?.value,
          refId: params?.[1]?.value as number | undefined
        };

      case 'batch':
      case 'force_batch':

      case 'batch_all':
        {
          const calls = (params?.[0].value as CallsParam[]).map(({ call_module, call_name }) => `${call_module} (${call_name})`);

          return { calls };
        }

      case 'transfer_keep_alive':
      case 'transfer_allow_death':
      case 'transfer_all':

      case 'transfer':
        {
          const toId = (params?.[0].value as AccountId | undefined)?.Id;
          const paramTo = toId ? encodeAddress(hexToU8a(toId), prefix) : '';
          const paramAmount = params?.[1].value as string | undefined;

          const { amount = paramAmount, from = '', to = paramTo } = transfer ?? {};

          return {
            amount,
            from,
            to
          };
        }

      case 'rebond':

      case 'unbond':
        {
          const amount = (params?.[1]?.value || params?.[1]?.value) as string | undefined;

          return { amount };
        }

      case 'bond':
        {
          const amount = params?.[0].value as string | undefined;

          return { amount };
        }

      case 'bond_extra':
        {
          const bondAmount =
            (params?.[0]?.value as BondExtraRewards)?.Rewards ||
            (params?.[0]?.value as BondExtraFreeBalance)?.FreeBalance ||
            (params?.[0]?.value as string | undefined) ||
            '0';

          const amount = isNaN(Number(bondAmount)) ? '0' : bondAmount;

          return { amount };
        }

      case 'nominate':
        {
          const nominatorsRaw = params?.[0]?.value;
          const nominatorsArr = Array.isArray(nominatorsRaw) ? nominatorsRaw : [];
          const nominators = nominatorsArr.map(({ Id }) => encodeAddress(hexToU8a(Id), prefix));

          return { nominators };
        }

      case 'join':
        {
          const amount = params?.[0].value as string | undefined;
          const poolId = params?.[1].value as string | undefined;

          return { amount, poolId };
        }

      case 'proxy':
        {
          const call_name = (params?.[2].value as CallsParam).call_name;
          const call_module = (params?.[2].value as CallsParam).call_module;

          const calls = [`${call_module} (${call_name})`];

          return { calls };
        }

      default:
        return {};
    }
  } catch (error) {
    console.error(error);

    return {};
  }
}
