// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AiTxAnyJson } from '@polkadot/extension-base/utils/AiUtils/aiTypes';
import type { Chain } from '@polkadot/extension-chains/types';

import { hexToU8a, isHex } from '@polkadot/util';

export function decodeCallIndex (chain: Chain | null | undefined, val: string) {
  try {
    if (!chain || !isHex(val)) {
      return val;
    }

    const call = chain.registry.findMetaCall(hexToU8a(val));

    return `${call.section} → ${call.method}`;
  } catch {
    return val;
  }
}

type ProcessCallResult = string | Record<string, unknown> | null;

interface CallObject {
  callIndex?: string;
  args?: {
    call?: AiTxAnyJson;
    calls?: AiTxAnyJson[];
    [key: string]: unknown;
  };
}

/**
 * Processes a call object recursively, decoding call indexes and handling nested structures
 * @param obj - The call object to process
 * @param chain - The blockchain chain context
 * @returns Decoded call name, nested structure, or null if invalid
 */
export function processCall (
  obj: AiTxAnyJson,
  chain: Chain | null | undefined
): ProcessCallResult {
  if (!isValidCallObject(obj)) {
    return null;
  }

  const callObj = obj;
  const decodedName = decodeCallIndex(chain, callObj.callIndex as unknown as string);

  // Handle proxy-type structures with single nested call
  const singleNestedResult = processSingleNestedCall(callObj, chain);

  if (singleNestedResult) {
    return { [decodedName]: singleNestedResult };
  }

  // Handle batch-type structures with multiple nested calls
  const batchNestedResult = processBatchNestedCalls(callObj, chain);

  if (batchNestedResult) {
    return { [decodedName]: batchNestedResult };
  }

  // No nested calls - return just the decoded name
  return decodedName;
}

/**
 * Validates if the object has a callIndex property
 */
function isValidCallObject (obj: AiTxAnyJson): obj is CallObject {
  return obj?.['callIndex'] !== undefined && typeof obj['callIndex'] === 'string';
}

/**
 * Processes a single nested call in args.call (proxy pattern)
 */
function processSingleNestedCall (
  callObj: CallObject,
  chain: Chain | null | undefined
): ProcessCallResult {
  const nestedCall = callObj.args?.call;

  if (!nestedCall) {
    return null;
  }

  return processCall(nestedCall, chain);
}

/**
 * Processes multiple nested calls in args.calls (batch pattern)
 */
function processBatchNestedCalls (
  callObj: CallObject,
  chain: Chain | null | undefined
): (string | Record<string, unknown>)[] | null {
  const nestedCalls = callObj.args?.calls;

  if (!Array.isArray(nestedCalls) || nestedCalls.length === 0) {
    return null;
  }

  const processedCalls = nestedCalls
    .map((call) => processNestedCall(call, chain))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return processedCalls.length > 0 ? processedCalls : null;
}

/**
 * Processes an individual nested call, handling both simple and complex structures
 */
function processNestedCall (
  call: AiTxAnyJson,
  chain: Chain | null | undefined
): ProcessCallResult {
  if (!isValidCallObject(call)) {
    return null;
  }

  const recursiveResult = processCall(call, chain);

  // If the result is a complex nested structure, return it as-is
  // Otherwise, just return the decoded name
  return typeof recursiveResult === 'object' && recursiveResult !== null
    ? recursiveResult
    : recursiveResult;
}
