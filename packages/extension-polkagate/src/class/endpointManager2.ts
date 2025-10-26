// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointType } from '../util/types';

import { ENDPOINT_TIMEOUT } from '../util/constants';

const ENDPOINTS_NAME_IN_STORAGE = 'endpoints2';

// Define types for saved endpoints and listener function
type SavedEndpoints = Record<string, EndpointType>;
type Listener = (genesisHash: string, endpoint: EndpointType) => void;

export default class endpointManager2 {
  // Store endpoints and listeners
  private endpoints: SavedEndpoints = {};
  private listeners = new Set<Listener>();

  constructor () {
    // Load endpoints from storage and set up storage change listener
    this.loadFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  // Load endpoints from chrome storage
  private loadFromStorage () {
    chrome.storage.local.get(ENDPOINTS_NAME_IN_STORAGE, (result: { [ENDPOINTS_NAME_IN_STORAGE]?: SavedEndpoints }) => {
      if (result[ENDPOINTS_NAME_IN_STORAGE]) {
        this.endpoints = result[ENDPOINTS_NAME_IN_STORAGE];
        this.notifyListeners();
      }
    });
  }

  // Save endpoints to chrome storage
  private saveToStorage () {
    try {
      chrome.storage.local.set({ [ENDPOINTS_NAME_IN_STORAGE]: this.endpoints }).catch(console.error);
    } catch (error) {
      console.error('Unable to save the endpoint inside the storage!', error);
    }
  }

  // Handle changes in chrome storage
  private handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && changes[ENDPOINTS_NAME_IN_STORAGE]) {
      this.endpoints = changes[ENDPOINTS_NAME_IN_STORAGE].newValue as SavedEndpoints;
      this.notifyListeners();
    }
  };

  // Notify all listeners about endpoint changes
  private notifyListeners () {
    Object.entries(this.endpoints).forEach(([genesisHash, endpointInfo]) => {
      this.listeners.forEach((listener) => listener(genesisHash, endpointInfo));
    });
  }

  // Get a specific endpoint
  get (genesisHash: string): EndpointType | undefined {
    return this.endpoints?.[genesisHash];
  }

  // Get all endpoints
  getEndpoints (): SavedEndpoints | undefined {
    return this.endpoints;
  }

  // Set a specific endpoint
  set (genesisHash: string, endpoint: EndpointType) {
    if (!this.endpoints[genesisHash]) {
      this.endpoints[genesisHash] = {} as EndpointType;
    }

    this.endpoints[genesisHash] = endpoint;
    this.saveToStorage();
    this.notifyListeners();
  }

  // Check if an endpoint should be in auto mode
  shouldBeOnAutoMode (endpoint: EndpointType) {
    return endpoint.isAuto && (Date.now() - (endpoint.timestamp ?? 0) > ENDPOINT_TIMEOUT);
  }

  subscribe (listener: Listener) {
    this.listeners.add(listener);
  }

  unsubscribe (listener: Listener) {
    this.listeners.delete(listener);
  }
}
