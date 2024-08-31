// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NO_PASS_PERIOD as ENDPOINT_TIMEOUT } from '../util/constants';

// Define the structure for an endpoint
interface EndpointType {
  checkForNewOne?: boolean;
  endpoint: string | undefined;
  timestamp: number | undefined;
  isOnManual: boolean | undefined;
}

// Define types for saved endpoints and listener function
type SavedEndpoints = Record<string, Record<string, EndpointType>>;
type Listener = (address: string, genesisHash: string, endpoint: EndpointType) => void;

export class EndpointManager {
  // Store endpoints and listeners
  private endpoints: SavedEndpoints = {};
  private listeners: Listener[] = [];

  constructor () {
    // Load endpoints from storage and set up storage change listener
    this.loadFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  // Load endpoints from chrome storage
  private loadFromStorage () {
    chrome.storage.local.get('endpoints', (result: { endpoints?: Record<string, Record<string, EndpointType>> }) => {
      if (result.endpoints) {
        this.endpoints = result.endpoints;
        this.notifyListeners();
      }
    });
  }

  // Save endpoints to chrome storage
  private saveToStorage () {
    try {
      chrome.storage.local.set({ endpoints: this.endpoints }).catch(console.error);
    } catch (error) {
      console.error('Unable to save the endpoint inside the storage!', error);
    }
  }

  // Handle changes in chrome storage
  private handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && changes['endpoints']) {
      this.endpoints = changes['endpoints'].newValue as Record<string, Record<string, EndpointType>>;
      this.notifyListeners();
    }
  };

  // Notify all listeners about endpoint changes
  private notifyListeners () {
    Object.entries(this.endpoints).forEach(([address, chains]) => {
      Object.entries(chains).forEach(([genesisHash, endpoint]) => {
        this.listeners.forEach((listener) => listener(address, genesisHash, endpoint));
      });
    });
  }

  // Get a specific endpoint
  getEndpoint (address: string, genesisHash: string): EndpointType | undefined {
    return this.endpoints[address]?.[genesisHash];
  }

  // Get all endpoints
  getEndpoints (): SavedEndpoints | undefined {
    return this.endpoints;
  }

  // Set a specific endpoint
  setEndpoint (address: string, genesisHash: string, endpoint: EndpointType) {
    if (!this.endpoints[address]) {
      this.endpoints[address] = {};
    }

    this.endpoints[address][genesisHash] = endpoint;
    this.saveToStorage();
    this.notifyListeners();
  }

  // Check if an endpoint should be in auto mode
  shouldBeOnAutoMode (endpoint: EndpointType) {
    return !endpoint.isOnManual && (Date.now() - (endpoint.timestamp ?? 0) > ENDPOINT_TIMEOUT);
  }

  // Subscribe a listener to endpoint changes
  subscribe (listener: Listener) {
    this.listeners.push(listener);
  }

  // Unsubscribe a listener from endpoint changes
  unsubscribe (listener: Listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}
