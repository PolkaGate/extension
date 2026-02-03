// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions } from '@polkadot/api/submittable/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Vec } from '@polkadot/types';
import type { SignedBlock } from '@polkadot/types/interfaces';
// @ts-ignore
import type { FrameSystemEventRecord } from '@polkadot/types/lookup';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxResult } from '../types';

import { signatureVerify } from '@polkadot/util-crypto';

async function getAppliedFee(api: ApiPromise, signedBlock: SignedBlock, txHashHex: HexString): Promise<string | undefined> {
  const apiAt = await api.at(signedBlock.block.hash);
  const allEvents = await apiAt.query['system']['events']() as Vec<FrameSystemEventRecord>;

  let fee: string | undefined;

  try {
    const txIndex = signedBlock.block.extrinsics.findIndex((ex) => ex.hash.toHex() === txHashHex);

    if (txIndex >= 0) {
      allEvents
        .filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(txIndex))
        .forEach(({ event }) => {
          if (event.section === 'transactionPayment' && event.method === 'TransactionFeePaid') {
            fee = event.data[1].toString();
          }
        });
    }
  } catch (e) {
    console.log('Something went wrong while getting actual paid fee:', e);

    return fee;
  }

  return fee;
}

export async function handleResult(
  api: ApiPromise,
  resolve: (value: TxResult | PromiseLike<TxResult>) => void,
  result: ISubmittableResult
): Promise<void> {
  let success = true;
  let failureText = '';
  const event = new CustomEvent('transactionState', { detail: result.status.type });

  window.dispatchEvent(event);
  console.log('📝 Result:', result);

  try {
    if (result.dispatchError) {
      if (result.dispatchError.isModule) {
        // for module errors, we have the section indexed, lookup
        const decoded = api.registry.findMetaError(result.dispatchError.asModule);
        const { docs, name, section } = decoded;

        success = false;
        failureText = `${docs.join(' ')}`;

        console.log(`dispatchError module: ${section}.${name}: ${docs.join(' ')}`);
      } else {
        success = false;
        failureText = `${result.dispatchError.toString()}`;
      }
    }
  } catch (error) {
    success = false;
    const maybeErrorText = result?.dispatchError?.toString() || 'unknown error';

    failureText = `${maybeErrorText}`;
    console.error(error);
  }

  try {
    const { isCompleted, isError, status, txHash } = result;
    const { isDropped, isFinalityTimeout, isFinalized, isInBlock, isInvalid, isUsurped, type } = status;

    if (isFinalized || isInBlock) {
      const hash = isFinalized ? result.status.asFinalized : result.status.asInBlock;

      const signedBlock = await api.rpc.chain.getBlock(hash);
      const blockNumber = signedBlock.block.header.number;

      const fee = await getAppliedFee(api, signedBlock, txHash.toHex());

      resolve({ block: Number(blockNumber), failureText, fee, success, txHash: txHash.toString() });

      return;
    }

    if (isCompleted && isError) {
      resolve({ block: 0, failureText: failureText || `unknown error (${type})`, fee: '', success: false, txHash: '' });

      return;
    }

    if (isInvalid || isDropped || isUsurped || isFinalityTimeout) {
      resolve({ block: 0, failureText: failureText || status.type, fee: '', success: false, txHash: txHash?.toString() || '' });
    }
  } catch (e) {
    failureText = e instanceof Error ? e.message : String(e);

    console.log('❌ Dispatch error', failureText);
    resolve({ block: 0, failureText, fee: '', success: false, txHash: '' });
  }
}

export async function signAndSend(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
  pair: KeyringPair,
  options?: Partial<SignerOptions>
): Promise<TxResult> {
  return new Promise((resolve) => {
    console.log('signing and sending a tx ...');

    extrinsic.signAndSend(pair, options ?? {}, async (result) => {
      await handleResult(api, resolve, result);
    }).catch((e) => {
      console.log('⚠️ Catch error', e);
      resolve({ block: 0, failureText: String(e), fee: '', success: false, txHash: '' });
    });
  });
}

export async function send(
  from: string,
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
  payload: Uint8Array | ExtrinsicPayloadValue | HexString,
  signature: HexString
): Promise<TxResult> {
  return new Promise((resolve) => {
    console.log('✈️ Sending the transaction ... 🌥️');

    extrinsic.addSignature(from, signature, payload);

    let unsub: (() => void) | undefined;

    const onResult = async (result: ISubmittableResult) => {
      const { status } = result;

      await handleResult(api, resolve, result);

      if (
        status.isInBlock ||
        status.isFinalized ||
        status.isInvalid ||
        status.isDropped ||
        status.isUsurped ||
        // status.isRetracted ||
        status.isFinalityTimeout
      ) {
        unsub?.();
      }
    };

    const rebuiltExtrinsic = api.tx(extrinsic.toHex());

    rebuiltExtrinsic.send(onResult)
      .then((u) => {
        unsub = u;
      })
      .catch((e) => {
        console.log('⚠️ Catch error', e);
        resolve({ block: 0, failureText: String(e), fee: '', success: false, txHash: '' });
      });
  });
}
