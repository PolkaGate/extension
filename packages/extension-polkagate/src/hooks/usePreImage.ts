// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Bytes } from '@polkadot/types';
import type { AccountId, Balance, Call, Hash } from '@polkadot/types/interfaces';
import type { FrameSupportPreimagesBounded, PalletPreimageRequestStatus } from '@polkadot/types/lookup';
import type { ITuple, Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useEffect, useMemo, useState } from 'react';

import { Option } from '@polkadot/types';
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
  paramsStatus?: HexString;
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
    paramsStatus: proposalHash,
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

type BytesParamsType = [[proposalHash: HexString, proposalLength: BN]] | [proposalHash: HexString];

/** @internal Helper to unwrap a deposit tuple into a structure */
function convertDeposit(deposit?: [AccountId, Balance] | null): PreimageDeposit | undefined {
  return deposit
    ? {
      amount: deposit[1],
      who: deposit[0].toString()
    }
    : undefined;
}

interface BytesParams {
  paramsBytes?: BytesParamsType;
  resultPreimageFor?: PreimageStatus;
}

/** @internal Returns the parameters required for a call to bytes */
function getBytesParams(interimResult: PreimageStatus, optStatus: Option<PalletPreimageRequestStatus>): BytesParams {
  const result = objectSpread<PreimageStatus>({}, interimResult, {
    status: optStatus.unwrapOr(null)
  });

  if (result.status) {
    if (result.status.isRequested) {
      const asRequested = result.status.asRequested;

      if (asRequested instanceof Option) {
        // FIXME
      } else {
        const { count, deposit, len } = asRequested;

        result.count = count.toNumber();
        result.deposit = convertDeposit(deposit.unwrapOr(null));
        result.proposalLength = len.unwrapOr(BN_ZERO);
      }
    } else if (result.status.isUnrequested) {
      const asUnrequested = result.status.asUnrequested;

      if (asUnrequested instanceof Option) {
        result.deposit = convertDeposit(
          // old-style conversion
          (asUnrequested as Option<ITuple<[AccountId, Balance]>>).unwrapOr(null)
        );
      } else {
        const { deposit, len } = result.status.asUnrequested;

        result.deposit = convertDeposit(deposit);
        result.proposalLength = len;
      }
    } else {
      console.error(`Unhandled PalletPreimageRequestStatus type: ${result.status.type}`);
    }
  }

  return {
    paramsBytes: result.isHashParam
      ? [result.proposalHash]
      : [[result.proposalHash, result.proposalLength || BN_ZERO]],
    resultPreimageFor: result
  };
}

/** @internal Creates a final result */
function createResult(interimResult: PreimageStatus, optBytes: Option<Bytes> | Uint8Array): Preimage {
  const callData = isU8a(optBytes)
    ? optBytes
    : optBytes.unwrapOr(null);
  let proposal: Call | null = null;
  let proposalError: string | null = null;
  let proposalWarning: string | null = null;
  let proposalLength: BN | undefined;

  if (callData) {
    try {
      proposal = interimResult.registry.createType('Call', callData);

      const callLength = proposal.encodedLength;

      if (interimResult.proposalLength) {
        const storeLength = interimResult.proposalLength.toNumber();

        if (callLength !== storeLength) {
          proposalWarning = `Decoded call length does not match on-chain stored preimage length (${formatNumber(callLength)} bytes vs ${formatNumber(storeLength)} bytes)`;
        }
      } else {
        // for the old style, we set the actual length
        proposalLength = new BN(callLength);
      }
    } catch (error) {
      console.error(error);

      proposalError = 'Unable to decode preimage bytes into a valid Call';
    }
  } else {
    proposalWarning = 'No preimage bytes found';
  }

  return objectSpread<Preimage>({}, interimResult, {
    isCompleted: true,
    proposal,
    proposalError,
    proposalLength: proposalLength || interimResult.proposalLength,
    proposalWarning
  });
}

export default function usePreImage(address: string | undefined, hashOrBounded?: Hash | HexString | FrameSupportPreimagesBounded | null): Preimage | undefined {
  const api = useApi(address);
  const [optStatus, setOptStatus] = useState<Option<PalletPreimageRequestStatus>>();
  const [optBytes, setOptBytes] = useState<Option<Bytes>>();

  const { inlineData, paramsStatus, resultPreimageHash } = useMemo(
    () => hashOrBounded && api
      ? getPreimageHash(api, hashOrBounded)
      : {},
    [api, hashOrBounded]
  );

  useEffect(() => {
    api && !inlineData && paramsStatus && api.query.preimage?.statusFor(paramsStatus).then(setOptStatus);
  }, [api, inlineData, paramsStatus, setOptStatus]);

  // from the retrieved status (if any), get the on-chain stored bytes
  const { paramsBytes, resultPreimageFor } = useMemo(() => resultPreimageHash && optStatus ? getBytesParams(resultPreimageHash, optStatus) : {}, [optStatus, resultPreimageHash]);

  useEffect(() => {
    api && paramsBytes && api.query.preimage?.preimageFor(...paramsBytes).then(setOptBytes);
  }, [api, paramsBytes, setOptBytes]);

  return useMemo(() => resultPreimageFor && optBytes && createResult(resultPreimageFor, optBytes), [optBytes, resultPreimageFor]);
}
