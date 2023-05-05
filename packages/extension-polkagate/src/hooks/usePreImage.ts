// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call, Hash } from '@polkadot/types/interfaces';
import type { FrameSupportPreimagesBounded, PalletPreimageRequestStatus } from '@polkadot/types/lookup';
import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO, formatNumber, isString, isU8a, objectSpread, u8aToHex } from '@polkadot/util';

import { useApi } from '.';

export interface PreimageDeposit {
  amount: BN;
  who: string;
}

export interface PreimageStatus {
  count: number;
  deposit?: PreimageDeposit;
  isCompleted: boolean;
  isHashParam: boolean;
  proposalHash: HexString;
  proposalLength?: BN;
  registry: Registry;
  status: PalletPreimageRequestStatus | null;
}

export interface PreimageBytes {
  proposal?: Call | null;
  proposalError?: string | null;
  proposalWarning?: string | null;
}
export interface Preimage extends PreimageBytes, PreimageStatus {
  // just the interfaces above
}

interface StatusParams {
  inlineData?: Uint8Array;
  paramsStatus?: [HexString];
  proposalHash?: HexString;
  resultPreimageHash?: PreimageStatus;
}

type Result = 'unknown' | 'hash' | 'hashAndLen';

export function getParamType(api: ApiPromise): Result {
  if ((
    api.query.preimage &&
    api.query.preimage.preimageFor &&
    api.query.preimage.preimageFor.creator.meta.type.isMap
  )) {
    const { type } = api.registry.lookup.getTypeDef(api.query.preimage.preimageFor.creator.meta.type.asMap.key);

    if (type === 'H256') {
      return 'hash';
    } else if (type === '(H256,u32)') {
      return 'hashAndLen';
    }
  }

  return 'unknown';
}

export function getPreimageHash(api: ApiPromise, hashOrBounded: Hash | HexString | FrameSupportPreimagesBounded): StatusParams {
  let proposalHash: HexString | undefined;
  let inlineData: Uint8Array | undefined;

  if (isString(hashOrBounded)) {
    proposalHash = hashOrBounded;
  } else if (isU8a(hashOrBounded)) {
    proposalHash = hashOrBounded.toHex();
  } else {
    const bounded = hashOrBounded;

    if (bounded.isInline) {
      inlineData = bounded.asInline.toU8a(true);
      proposalHash = u8aToHex(api.registry.hash(inlineData));
    } else if (hashOrBounded.isLegacy) {
      proposalHash = hashOrBounded.asLegacy.hash_.toHex();
    } else if (hashOrBounded.isLookup) {
      proposalHash = hashOrBounded.asLookup.hash_.toHex();
    } else {
      console.error(`Unhandled FrameSupportPreimagesBounded type ${hashOrBounded.type}`);
    }
  }

  return {
    inlineData,
    paramsStatus: proposalHash && [proposalHash],
    proposalHash,
    resultPreimageHash: proposalHash && {
      count: 0,
      isCompleted: false,
      isHashParam: getParamType(api) === 'hash',
      proposalHash,
      proposalLength: inlineData && new BN(inlineData.length),
      registry: api.registry,
      status: null
    }
  };
}

export default function usePreImage(address: string | undefined, hashOrBounded?: Hash | HexString | FrameSupportPreimagesBounded | null): Preimage | undefined {
  const api = useApi(address);

  const { inlineData, paramsStatus, resultPreimageHash } = useMemo(
    () => hashOrBounded && api
      ? getPreimageHash(api, hashOrBounded)
      : {},
    [api, hashOrBounded]
  );

  console.log('inlineData, paramsStatus, resultPreimageHash==', inlineData, paramsStatus, resultPreimageHash);

  return;
}
