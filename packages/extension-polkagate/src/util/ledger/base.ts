// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import type Transport from '@ledgerhq/hw-transport';
import type { AccountOptions } from '@polkadot/hw-ledger/types';

import { Ledger, type LedgerTypes } from './types';

interface LedgerApp {
  transport: Transport;
}

export abstract class BaseLedger<T extends LedgerApp> extends Ledger {
  protected app: T | null = null;
  readonly txMetadataChainId?: string;
  readonly transport: LedgerTypes;
  readonly slip44: number;

  constructor (transport: LedgerTypes, slip44: number, txMetadataChainId?: string) {
    super();

    // u2f is deprecated
    if (!['hid', 'webusb'].includes(transport)) {
      throw new Error(`Unsupported transport ${transport}`);
    }

    this.txMetadataChainId = txMetadataChainId;
    this.transport = transport;
    this.slip44 = slip44;
  }

  protected abstract serializePath(accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): string
  protected abstract getApp(): Promise<T>

  protected withApp = async (fn: (_app: T) => Promise<V>): Promise<V> => {
    try {
      const app = await this.getApp();

      return await fn(app);
    } catch (error) {
      this.app = null;
      throw error;
    }
  };

  protected wrapError = async (promise: Promise<V>): Promise<V> => {
    try {
      return await promise;
    } catch (e) {
      throw Error(this.mappingError(new Error((e as Error).message)));
    }
  };

  disconnect (): Promise<void> {
    return this.withApp(async (app) => {
      await app.transport.close();
    });
  }

  abstract mappingError(error: Error): string;
}
