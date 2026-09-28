// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DiscoveredDevice } from '@ledgerhq/device-management-kit';

import { DeviceManagementKitBuilder } from '@ledgerhq/device-management-kit';
import { webHidTransportFactory } from '@ledgerhq/device-transport-kit-web-hid';
import { DMKTransport } from '@zondax/ledger-js';

const dmk = new DeviceManagementKitBuilder()
  .addTransport(webHidTransportFactory)
  .build();

export class LedgerTransportManager {
  private static instance: LedgerTransportManager;
  private transport: DMKTransport | null = null;
  private sessionId: string | null = null;

  static getInstance(): LedgerTransportManager {
    if (!LedgerTransportManager.instance) {
      LedgerTransportManager.instance = new LedgerTransportManager();
    }

    return LedgerTransportManager.instance;
  }

  async getTransport(): Promise<DMKTransport> {
    if (this.transport) {
      return this.transport;
    }

    const device = await new Promise<DiscoveredDevice>((resolve, reject) => {
      const subscription = dmk.startDiscovering({}).subscribe({
        error: reject,
        next: (discovered) => {
          subscription.unsubscribe();
          resolve(discovered);
        }
      });
    });

    this.sessionId = await dmk.connect({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true }
    });

    this.transport = new DMKTransport(dmk, this.sessionId);

    return this.transport;
  }

  public async closeTransport(): Promise<void> {
    if (this.sessionId) {
      await dmk.disconnect({ sessionId: this.sessionId });
      this.sessionId = null;
    }

    this.transport = null;
  }

  public onTransportDisconnect(callback: () => void): void {
    if (this.sessionId) {
      const sessionId = this.sessionId;

      dmk.getDeviceSessionState({ sessionId }).subscribe((state) => {
        if ('isConnected' in state && !state.isConnected) {
          this.transport = null;
          this.sessionId = null;
          callback();
        }
      });
    }
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // No implementation needed here
  }
}
