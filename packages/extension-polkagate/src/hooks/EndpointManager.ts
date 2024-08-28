// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NO_PASS_PERIOD as ENDPOINT_TIMEOUT } from '../util/constants';

interface EndpointType {
  checkForNewOne?: boolean;
  endpoint: string | undefined;
  timestamp: number | undefined;
  isOnManuel: boolean | undefined;
}

type Listener = (address: string, genesisHash: string, endpoint: EndpointType) => void;

export class EndpointManager {
  private endpoints: Record<string, Record<string, EndpointType>> = {};
  private listeners: Listener[] = [];

  constructor () {
    this.loadFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  private loadFromStorage () {
    chrome.storage.local.get('endpoints', (result: { endpoints?: Record<string, Record<string, EndpointType>> }) => {
      if (result.endpoints) {
        this.endpoints = result.endpoints;
        this.notifyListeners();
      }
    });
  }

  private saveToStorage () {
    chrome.storage.local.set({ endpoints: this.endpoints }).catch(console.error);
  }

  private handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && changes['endpoints']) {
      this.endpoints = changes['endpoints'].newValue as Record<string, Record<string, EndpointType>>;
      this.notifyListeners();
    }
  };

  private notifyListeners () {
    Object.entries(this.endpoints).forEach(([address, chains]) => {
      Object.entries(chains).forEach(([genesisHash, endpoint]) => {
        this.listeners.forEach((listener) => listener(address, genesisHash, endpoint));
      });
    });
  }

  getEndpoint (address: string, genesisHash: string): EndpointType | undefined {
    return this.endpoints[address]?.[genesisHash];
  }

  setEndpoint (address: string, genesisHash: string, endpoint: EndpointType) {
    if (!this.endpoints[address]) {
      this.endpoints[address] = {};
    }

    this.endpoints[address][genesisHash] = endpoint;
    this.saveToStorage();
    this.notifyListeners();
  }

  //   isOldEndpoint (timestamp: number | undefined): boolean {
  //     if (!timestamp) {
  //       return true;
  //     }

  //     return Date.now() - timestamp > ENDPOINT_TIMEOUT;
  //   }

  shouldBeOnAutoMode (endpoint: EndpointType) {
    return endpoint.isOnManuel && (Date.now() - (endpoint.timestamp ?? 0) > ENDPOINT_TIMEOUT);
  }

  subscribe (listener: Listener) {
    this.listeners.push(listener);
  }

  unsubscribe (listener: Listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}
