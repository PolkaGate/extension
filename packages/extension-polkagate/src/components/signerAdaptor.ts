// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
import type { UnsignedTransaction } from '@ethersproject/transactions';
import type { KeyringPair } from '@polkadot/keyring/types';

import { arrayify } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { serialize } from '@ethersproject/transactions';
import { type BytesLike, ethers, type Provider, type SignatureLike, type TransactionRequest, type TransactionResponse } from 'ethers';

export class KeyringEthSigner {
  readonly keypair: KeyringPair;
  readonly provider: Provider;

  constructor(keypair: KeyringPair, provider: Provider) {
    this.keypair = keypair;
    this.provider = provider;
  }

  getAddress(): string {
    return this.keypair.address;
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    const chainId = tx.chainId ?? 1;
    const nonce = tx.nonce ?? 0;
    const gasPrice = BigInt(tx.gasPrice ?? ethers.parseUnits('10', 'gwei'));
    const gasLimit = BigInt(tx.gasLimit ?? 21000);
    const to = tx.to?.toString() ?? undefined;
    const value = BigInt(tx.value ?? 0n);
    const data = (tx.data ? arrayify(tx.data) : new Uint8Array([])) as BytesLike;

    const txUnsigned: UnsignedTransaction = {
      chainId: Number(chainId),
      data,
      gasLimit,
      gasPrice,
      nonce,
      to,
      value
    };

    const serializedUnsigned = serialize(txUnsigned);

    const msgHash = keccak256(arrayify(serializedUnsigned));

    const sigBytes = this.keypair.sign(msgHash);

    const sig = new Uint8Array(sigBytes);
    const r = '0x' + Buffer.from(sig.slice(0, 32)).toString('hex');
    const s = '0x' + Buffer.from(sig.slice(32, 64)).toString('hex');
    const v = sig[64] + 27;

    const sigTyped: SignatureLike = { r, s, v };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return serialize(txUnsigned, sigTyped);
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const signedTx = await this.signTransaction(tx);

    return this.provider.broadcastTransaction(signedTx);
  }
}
