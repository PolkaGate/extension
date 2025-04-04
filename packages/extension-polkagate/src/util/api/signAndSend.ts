// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxResult } from '../types';

export async function signAndSend(
  api: ApiPromise,
  submittable: SubmittableExtrinsic<'promise', ISubmittableResult>,
  _signer: KeyringPair,
  sender: string
): Promise<TxResult> {
  return new Promise((resolve) => {
    console.log('signing and sending a tx ...', sender);

    // eslint-disable-next-line no-void
    void submittable.signAndSend(_signer, async (result) => {
      let success = true;
      let failureText = '';
      const parsedRes = JSON.parse(JSON.stringify(result));
      const event = new CustomEvent('transactionState', { detail: parsedRes.status });

      window.dispatchEvent(event);
      console.log(parsedRes);

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const maybeErrorText = result?.dispatchError?.toString() || 'unknown error';

        failureText = `${maybeErrorText}`;
        console.log(error);
      }

      try {
        if (result.status.isFinalized || result.status.isInBlock) {
          console.log('Tx. Status: ', result.status);
          const hash = result.status.isFinalized ? result.status.asFinalized : result.status.asInBlock;

          const signedBlock = await api.rpc.chain.getBlock(hash);
          const blockNumber = signedBlock.block.header.number;
          const txHash = result.txHash.toString();

          // FIXME: Do we need to get applied fee from blockchain
          // search for the hash of the extrinsic in the block
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          // signedBlock.block.extrinsics.forEach(async (ex) => {
          //   if (ex.isSigned) {
          //     if (String(ex.signer) == senderAddress) {
          /** since the api is replaced hence needs more effort to calculate the */
          // const queryInfo = await api.call.transactionPaymentApi.queryInfo(ex.toHex(), signedBlock.block.hash);

          const fee = undefined; // queryInfo.partialFee.toString();

          resolve({ block: Number(blockNumber), failureText, fee, success, txHash });
          //     }
          //   }
          // });
        }
      } catch (e) {
        resolve({ block: 0, failureText: String(e), fee: '', success: false, txHash: '' });
      }
    }).catch((e) => {
      console.log('catch error', e);
      resolve({ block: 0, failureText: String(e), fee: '', success: false, txHash: '' });
    });
  });
}

export async function send(
  from: string | AccountId,
  api: ApiPromise,
  ptx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  payload: Uint8Array | ExtrinsicPayloadValue | HexString,
  signature: HexString
): Promise<TxResult> {
  return new Promise((resolve) => {
    console.log('sending the transaction ...');

    ptx.addSignature(from, signature, payload);

    // eslint-disable-next-line no-void
    void ptx.send(async (result) => {
      let success = true;
      let failureText = '';
      const parsedRes = JSON.parse(JSON.stringify(result));
      const event = new CustomEvent('transactionState', { detail: parsedRes.status });

      window.dispatchEvent(event);
      console.log(parsedRes);

      if (result.dispatchError) {
        if (result.dispatchError.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = api.registry.findMetaError(result.dispatchError.asModule);
          const { docs, name, section } = decoded;

          success = false;
          failureText = `${docs.join(' ')}`;

          console.log(`dispatchError module: ${section}.${name}: ${docs.join(' ')}`);
        } else {
          // Other, CannotLookup, BadOrigin, no extra info
          console.log(`dispatchError other reason: ${result.dispatchError.toString()}`);
        }
      }

      if (result.status.isFinalized || result.status.isInBlock) {
        console.log('Tx. Status: ', result.status);
        const hash = result.status.isFinalized ? result.status.asFinalized : result.status.asInBlock;

        const signedBlock = await api.rpc.chain.getBlock(hash);
        const blockNumber = signedBlock.block.header.number;
        const txHash = result.txHash.toString();

        const fee = undefined;

        resolve({ block: Number(blockNumber), failureText, fee, success, txHash });
      }
    }).catch((e) => {
      console.log('catch error', e);
      resolve({ block: 0, failureText: String(e), fee: '', success: false, txHash: '' });
    });
  });
}
