// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type Transport from '@ledgerhq/hw-transport';
import type { LedgerTypes } from './types';

import { transports } from '@polkadot/hw-ledger-transports';

export class LedgerTransportManager {
  private static instance: LedgerTransportManager;
  private transport: Transport | null = null;

  static getInstance(): LedgerTransportManager {
    if (!LedgerTransportManager.instance) {
      LedgerTransportManager.instance = new LedgerTransportManager();
    }

    return LedgerTransportManager.instance;
  }

  async getTransport(): Promise<Transport> {
    if (this.transport) {
      return this.transport;
    }

    const transportType = this.getLedgerTransportTypeSupport();

    if (!transportType) {
      throw new Error('No supported Ledger transport found');
    }

    const def = transports.find(({ type }) => type === transportType);

    if (!def) {
      throw new Error(`Unable to find a transport for ${transportType}`);
    }

    this.transport = await def.create();

    this.transport.on?.('disconnect', () => {
      this.transport = null;
      console.warn('[Ledger] Disconnected');
    });

    return this.transport;
  }

  public async closeTransport() {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
  }

  public onTransportDisconnect(callback: () => void): void {
    if (this.transport) {
      const disconnectListener = () => {
        callback();
        this.transport?.off?.('disconnect', disconnectListener);
      };

      this.transport.on?.('disconnect', disconnectListener);
    }
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // No implementation needed here
  }

  private getLedgerTransportTypeSupport = (): LedgerTypes | null => {
    const supportsHID = 'hid' in navigator || 'HID' in window;
    const supportsWebUSB = 'usb' in navigator || 'USB' in window;

    return supportsHID ? 'hid' : supportsWebUSB ? 'webusb' : null;
  };
}
