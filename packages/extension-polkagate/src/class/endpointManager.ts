// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointType } from '../util/types';

import { NO_PASS_PERIOD as ENDPOINT_TIMEOUT } from '../util/constants';

// Define types for saved endpoints and listener function
type SavedEndpoints = Record<string, Record<string, EndpointType>>;
type Listener = (address: string, genesisHash: string, endpoint: EndpointType) => void;

export default class EndpointManager {
  // Store endpoints and listeners
  private endpoints: SavedEndpoints = {};
  private listeners = new Set<Listener>();

  constructor() {
    // Load endpoints from storage and set up storage change listener
    this.loadFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  // Load endpoints from chrome storage
  private loadFromStorage() {
    chrome.storage.local.get('endpoints', (result: { endpoints?: SavedEndpoints }) => {
      if (result.endpoints) {
        this.endpoints = result.endpoints;
        this.notifyListeners();
      }
    });
  }

  // Save endpoints to chrome storage
  private saveToStorage() {
    try {
      chrome.storage.local.set({ endpoints: this.endpoints }).catch(console.error);
    } catch (error) {
      console.error('Unable to save the endpoint inside the storage!', error);
    }
  }

  // Handle changes in chrome storage
  private handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && changes['endpoints']) {
      this.endpoints = changes['endpoints'].newValue as SavedEndpoints;
      this.notifyListeners();
    }
  };

  // Notify all listeners about endpoint changes
  private notifyListeners() {
    Object.entries(this.endpoints).forEach(([address, endpointInfo]) => {
      Object.entries(endpointInfo).forEach(([genesisHash, endpoint]) => {
        this.listeners.forEach((listener) => listener(address, genesisHash, endpoint));
      });
    });
  }

  // Get a specific endpoint
  get(address: string, genesisHash: string): EndpointType | undefined {
    return this.endpoints[address]?.[genesisHash];
  }

  // Get all endpoints
  getEndpoints(): SavedEndpoints | undefined {
    return this.endpoints;
  }

  // Set a specific endpoint
  set(address: string, genesisHash: string, endpoint: EndpointType) {
    if (!this.endpoints[address]) {
      this.endpoints[address] = {};
    }

    this.endpoints[address][genesisHash] = endpoint;
    this.saveToStorage();
    this.notifyListeners();
  }

  // Check if an endpoint should be in auto mode
  shouldBeOnAutoMode(endpoint: EndpointType) {
    return endpoint.isAuto && (Date.now() - (endpoint.timestamp ?? 0) > ENDPOINT_TIMEOUT);
  }

  // Subscribe a listener to endpoint changes
  subscribe(listener: Listener) {
    this.listeners.add(listener);
  }

  // Unsubscribe a listener from endpoint changes
  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }
}
