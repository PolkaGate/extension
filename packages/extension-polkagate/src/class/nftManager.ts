// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation, ItemMetadata, ItemOnChainInfo } from '../fullscreen/nft/utils/types';
import type { NftItemsType } from '../util/types';

// Define types for listener functions
type Listener = (address: string, nftItemsInformation: ItemInformation[]) => void;
type InitializationListener = () => void;

// Error class for NFT-specific errors
class NftManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NftManagerError';
  }
}

export default class NftManager {
  // Store nft items and listeners
  private nfts: NftItemsType = {};
  private listeners = new Set<Listener>();
  private initializationListeners = new Set<InitializationListener>();
  private readonly STORAGE_KEY = 'nftItems';
  private isInitialized = false;
  private initializationPromise: Promise<void>;

  constructor() {
    // Load nft items from storage and set up storage change listener
    this.initializationPromise = this.loadFromStorage();
    chrome.storage.onChanged.addListener(this.handleStorageChange);
  }

  // Wait for initialization to complete
  public async waitForInitialization(): Promise<void> {
    return this.initializationPromise;
  }

  // Notify all listeners about initialization
  private notifyInitializationListeners(): void {
    this.initializationListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('Error in initialization listener:', error);
      }
    });
    this.initializationListeners.clear();
  }

  // Load nft items from chrome storage
  private async loadFromStorage(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);

      this.nfts = result[this.STORAGE_KEY] as NftItemsType || {};
      this.isInitialized = true;

      this.notifyInitializationListeners();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load NFT items from storage:', error);
      throw new NftManagerError('Failed to load NFT items from storage');
    }
  }

  // Save nft items to chrome storage with debouncing
  private saveToStorage = (() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timeoutId = setTimeout(async () => {
        try {
          await chrome.storage.local.set({ [this.STORAGE_KEY]: this.nfts });
        } catch (error) {
          console.error('Failed to save NFT items to storage:', error);
          throw new NftManagerError('Failed to save NFT items to storage');
        }
      }, 1000); // Debounce for 1 second
    };
  })();

  // Handle changes in chrome storage
  private handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && changes[this.STORAGE_KEY]) {
      this.nfts = changes[this.STORAGE_KEY].newValue as NftItemsType;
      this.notifyListeners();
    }
  };

  // Notify all listeners about nfts items changes
  private notifyListeners(): void {
    if (!this.isInitialized) {
      return;
    }

    Object.entries(this.nfts).forEach(([address, nftItemsInformation]) => {
      this.listeners.forEach((listener) => {
        try {
          listener(address, nftItemsInformation);
        } catch (error) {
          console.error('Error in listener:', error);
        }
      });
    });
  }

  // Get nft items for a specific
  get(address: string): ItemInformation[] | null | undefined {
    if (!address) {
      throw new NftManagerError('Address is required');
    }

    return address in this.nfts && this.nfts[address].length === 0
      ? null
      : this.nfts?.[address];
  }

  // Get all nft items
  getAll(): NftItemsType | null | undefined {
    return this.nfts;
  }

  // Set on-chain nft item for a specific address
  setOnChainItemsInfo(data: NftItemsType) {
    if (!data) {
      throw new NftManagerError('NFT items information are required to set on-chain information');
    }

    for (const address in data) {
      if (!this.nfts[address]) {
        this.nfts[address] = [];
      }

      const nftItemsInfo = data[address];

      const existingItems = new Set(
        this.nfts[address].map((item) => this.getItemKey(item))
      );

      const newItems = nftItemsInfo.filter(
        (item) => !existingItems.has(this.getItemKey(item))
      );

      if (newItems.length > 0) {
        this.nfts[address].push(...newItems);
        this.saveToStorage();
        this.notifyListeners();
      }
    }
  }

  private getItemKey(item: ItemOnChainInfo): string {
    return `${item.chainName}-${item.collectionId}-${item.itemId}-${item.isNft}`;
  }

  // Set nft item detail for a specific address and item
  setItemDetail(address: string, nftItemInfo: ItemInformation, nftItemDetail: ItemMetadata | null) {
    if (!address || !nftItemInfo || nftItemDetail === undefined) {
      throw new NftManagerError('Address, NFT item info, and detail are required');
    }

    if (!this.nfts[address]) {
      return;
    }

    const itemIndex = this.nfts[address].findIndex(
      (item) => this.getItemKey(item) === this.getItemKey(nftItemInfo)
    );

    if (itemIndex === -1) {
      return;
    }

    this.nfts[address][itemIndex] = {
      ...this.nfts[address][itemIndex],
      ...(nftItemDetail ?? { noData: true })
    };

    this.saveToStorage();
    this.notifyListeners();
  }

  // Subscribe a listener to endpoint changes
  subscribe(listener: Listener) {
    this.listeners.add(listener);
  }

  // Unsubscribe a listener from endpoint changes
  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }

  // Cleanup method to remove listeners and clear data
  public destroy(): void {
    chrome.storage.onChanged.removeListener(this.handleStorageChange);
    this.listeners.clear();
    this.nfts = {};
  }
}
