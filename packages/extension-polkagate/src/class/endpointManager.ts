// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointType } from '../util/types';

import { ENDPOINT_TIMEOUT } from '../util/constants';

const ENDPOINTS_NAME_IN_STORAGE = 'endpoints2';

// Define types for saved endpoints and listener function
type SavedEndpoints = Record<string, EndpointType>;
type Listener = (genesisHash: string, endpoint: EndpointType | undefined) => void;

function areEndpointsEqual(a?: EndpointType, b?: EndpointType): boolean {
  return a?.checkForNewOne === b?.checkForNewOne &&
    a?.endpoint === b?.endpoint &&
    a?.isAuto === b?.isAuto &&
    a?.timestamp === b?.timestamp;
}

export default class EndpointManager {
  // Store endpoints and listeners
  private endpoints: SavedEndpoints = {};
  private listeners = new Set<Listener>();

  constructor() {
    this.loadFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  private loadFromStorage() {
    chrome.storage.local.get(ENDPOINTS_NAME_IN_STORAGE, (result: { [ENDPOINTS_NAME_IN_STORAGE]?: SavedEndpoints }) => {
      if (result[ENDPOINTS_NAME_IN_STORAGE]) {
        this.endpoints = result[ENDPOINTS_NAME_IN_STORAGE];
        this.notifyListeners();
      }
    });
  }

  private saveToStorage() {
    try {
      chrome.storage.local.set({ [ENDPOINTS_NAME_IN_STORAGE]: this.endpoints }).catch(console.error);
    } catch (error) {
      console.error('Unable to save the endpoint inside the storage!', error);
    }
  }

  private handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && changes[ENDPOINTS_NAME_IN_STORAGE]) {
      const previousEndpoints = (changes[ENDPOINTS_NAME_IN_STORAGE].oldValue ?? {}) as SavedEndpoints;

      this.endpoints = (changes[ENDPOINTS_NAME_IN_STORAGE].newValue ?? {}) as SavedEndpoints;

      const changedGenesisHashes = new Set([
        ...Object.keys(previousEndpoints || {}),
        ...Object.keys(this.endpoints || {})
      ]);

      changedGenesisHashes.forEach((genesisHash) => {
        const previousEndpoint = previousEndpoints?.[genesisHash];
        const nextEndpoint = this.endpoints?.[genesisHash];

        if (!areEndpointsEqual(previousEndpoint, nextEndpoint)) {
          this.listeners.forEach((listener) => listener(genesisHash, nextEndpoint));
        }
      });
    }
  };

  private notifyListeners() {
    Object.entries(this.endpoints).forEach(([genesisHash, endpointInfo]) => {
      this.listeners.forEach((listener) => listener(genesisHash, endpointInfo));
    });
  }

  // Get a specific endpoint
  get(genesisHash: string): EndpointType | undefined {
    return this.endpoints?.[genesisHash];
  }

  // Get all endpoints
  getEndpoints(): SavedEndpoints | undefined {
    return this.endpoints;
  }

  set(genesisHash: string, endpoint: EndpointType) {
    if (!this.endpoints[genesisHash]) {
      this.endpoints[genesisHash] = {} as EndpointType;
    }

    this.endpoints[genesisHash] = endpoint;
    this.saveToStorage();
    this.notifyListeners();
  }

  remove(genesisHash: string) {
    if (!this.endpoints[genesisHash]) {
      return;
    }

    delete this.endpoints[genesisHash];
    this.saveToStorage();
    this.listeners.forEach((listener) => listener(genesisHash, undefined));
  }

  shouldBeOnAutoMode(endpoint: EndpointType) {
    return endpoint.isAuto && (Date.now() - (endpoint.timestamp ?? 0) > ENDPOINT_TIMEOUT);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }
}
