// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountOptions, LedgerAddress, LedgerSignature, LedgerVersion } from '@polkadot/hw-ledger/types';

import { PolkadotGenericApp } from '@zondax/ledger-substrate';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { LEDGER_SUCCESS_CODE } from '@polkadot/hw-ledger/constants';
import { hexAddPrefix, hexStripPrefix, u8aToHex } from '@polkadot/util';

import { BaseLedger } from './base';
import { LEDGER_ERROR, SCHEME } from './consts';

interface ResponseSign {
  returnCode: number;
  errorMessage: string;
}

export async function loadWasm() {
  const imports = {};

  return await WebAssembly.instantiateStreaming(fetch('./metadata_shortener.wasm'), imports);
}

export class GenericLedger extends BaseLedger<PolkadotGenericApp> {
  protected scheme = SCHEME.ED25519;
  protected ss58_addr_type = 42;

   constructor(slip44: number, scheme = SCHEME.ED25519) {
    super(slip44);
    this.scheme = scheme;
  }

  getVersion(): Promise<LedgerVersion> {
    return this.withApp(async (app): Promise<LedgerVersion> => {
      const { deviceLocked: locked, major, minor, patch, testMode } = await app.getVersion();

      return {
        isLocked: !!locked,
        isTestMode: !!testMode,
        version: [major || 0, minor || 0, patch || 0]
      };
    });
  }

  serializePath(accountOffset = 0, addressOffset = 0, accountOptions?: Partial<AccountOptions>): string {
    const account = (accountOptions?.account || 0) + (accountOffset || 0);
    const addressIndex = (accountOptions?.addressIndex || 0) + (addressOffset || 0);
    const change = accountOptions?.change || 0;

    return `m/44'/${this.slip44}'/${account}'/${change}'/${addressIndex}'`;
  }

  getAddress(confirm?: boolean, accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): Promise<LedgerAddress> {
    return this.withApp(async (app): Promise<LedgerAddress> => {
      const path = this.serializePath(accountOffset, addressOffset, accountOptions);
      const isEcdsa = this.scheme === SCHEME.ECDSA;

      const { address, pubKey } = isEcdsa
        ? await this.wrapError(app.getAddressEcdsa(path, confirm))
        : await this.wrapError(app.getAddressEd25519(path, this.ss58_addr_type, confirm));

      return {
        address: isEcdsa ? hexAddPrefix(address) : address,
        publicKey: hexAddPrefix(pubKey)
      };
    });
  }

  async signTransaction(tx: Uint8Array, metadata: Uint8Array, accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): Promise<LedgerSignature> {
    return this.withApp(async (app): Promise<LedgerSignature> => {
      const path = this.serializePath(accountOffset, addressOffset, accountOptions);

      const signer = this.scheme === SCHEME.ECDSA ? 'signWithMetadataEcdsa' : 'signWithMetadataEd25519';
      const { signature } = await this.wrapError(app[signer](path, Buffer.from(tx), Buffer.from(metadata)));

      return {
        signature: hexAddPrefix(u8aToHex(signature))
      };
    });
  }

  async signMessage(message: Uint8Array, accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): Promise<LedgerSignature> {
    return this.withApp(async (app): Promise<LedgerSignature> => {
      const path = this.serializePath(accountOffset, addressOffset, accountOptions);
      const signer = this.scheme === SCHEME.ECDSA ? 'signRawEcdsa' : 'signRawEd25519';

      const { signature: rawSignature } = await this.wrapError(app[signer](path, Buffer.from(wrapBytes(message))));

      if (this.scheme === SCHEME.ECDSA) {
        return {
          signature: hexAddPrefix(u8aToHex(rawSignature))
        };
      }

      const raw = hexStripPrefix(u8aToHex(rawSignature));
      const firstByte = raw.slice(0, 2);
      // Source: https://github.com/polkadot-js/common/blob/a82ebdf6f9d78791bd1f21cd3c534deee37e0840/packages/keyring/src/pair/index.ts#L29-L34
      const isExtraByte = firstByte === '00';

      return {
        // Remove first byte (signature_type) from signature
        signature: isExtraByte ? hexAddPrefix(raw.slice(2)) : hexAddPrefix(raw)
      };
    });
  }

  getApp = async (): Promise<PolkadotGenericApp> => {
    if (!this.app) {
      const transport = await GenericLedger.transportManager.getTransport();

      this.app = new PolkadotGenericApp(transport);
    }

    return this.app;
  };

  protected override wrapError = async<V>(promise: Promise<V>): Promise<V> => {
  try {
    const result = await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        GenericLedger.transportManager.onTransportDisconnect(() => {
          reject(new Error('Transport disconnected'));
        });
      })
    ]) as ResponseSign;

    if (!result.returnCode || result.returnCode === LEDGER_SUCCESS_CODE) {
      return result as V;
    }

    throw new Error(result.errorMessage);
  } catch (e) {
    const error = e as Error;

    error.message = this.mappingError(error);

    throw error;
  }
};

mappingError(_error: Error): string {
  const error = _error.message || (_error as unknown as ResponseSign).errorMessage;

  if (error.includes('28160') || error.includes('CLA Not Supported') || error.includes('App does not seem to be open')) {
    return LEDGER_ERROR.OPEN_APP;
  }

  if (error.includes('21781') || error.includes('Device Locked')) {
    return LEDGER_ERROR.LOCKED;
  }

  return error;
}
}
