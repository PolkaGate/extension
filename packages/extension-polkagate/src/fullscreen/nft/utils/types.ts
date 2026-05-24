// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

export interface ItemOnChainInfo {
  collectionId?: string;
  chainName: string; // polkadot, kusama or westend asset hubs
  genesisHash?: string;
  itemId?: string;
  data?: string;
  isNft: boolean;
  isCollection: boolean;
  creator?: string | undefined;
  owner: string;
  price?: number | null | undefined;
  items?: number;
}

export interface ItemMetadata {
  animation_url?: string | null;
  name?: string | undefined;
  description?: string | undefined;
  image?: string | null | undefined;
  attributes?: Attribute[] | undefined;
  tags?: string[] | undefined;
  metadataLink?: string;
  imageContentType?: string;
  animationContentType?: string;
  mediaUri?: string;
}

export interface ItemInformation extends ItemOnChainInfo, ItemMetadata {
  noData?: boolean;
  collectionName?: string;
}

export interface FilterSectionProps {
  items: ItemInformation[] | null | undefined;
  setItemsToShow: React.Dispatch<React.SetStateAction<ItemInformation[] | null | undefined>>;
}

export interface CheckboxButtonProps {
  title: string;
  checked: boolean;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface Attribute {
  [key: string]: string;
}

export type ItemsDetail = Record<string, ItemMetadata | null | undefined>;

export interface ThumbnailProps {
  itemInformation: ItemInformation | undefined;
  api: ApiPromise | undefined;
}

export interface ItemAvatarProp {
  image: string | null | undefined;
  onFullscreen?: () => void;
  size?: 'small' | 'large';
}

export interface FullscreenNftModalProps {
  source: string | null | undefined;
  onClose: () => void;
  iFrame?: boolean;
  open: boolean;
}

export interface DetailsProp {
  api: ApiPromise | undefined;
  itemInformation: ItemInformation;
  show: boolean;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface DetailProp {
  title?: string;
  text?: string;
  inline?: boolean;
  isThumbnail?: boolean;
  accountId?: string;
  api?: ApiPromise;
  chain?: Chain | null;
  price?: number | null;
  divider?: boolean;
  link?: string;
  linkName?: string;
}

export interface ItemsListProps {
  nfts: ItemInformation[] | null | undefined;
}

export interface DataType {
  url: string;
  contentType?: string | undefined;
}

export type NftsPrices = [number, string | null] | null;

export interface DetailItemProps {
  animation_url: string | null | undefined;
  animationContentType: string | undefined;
  imageContentType: string | undefined;
  image: string | null | undefined;
  setShowFullscreenDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AudioPlayerProps {
  audioUrl: string | undefined | null;
}

export interface FilterState {
  collections: boolean;
  nft: boolean;
  unique: boolean;
  kusama: boolean;
  polkadot: boolean;
}

export interface FilterAction {
  filter: keyof FilterState;
}

export interface SortState {
  lowPrice: boolean;
  highPrice: boolean;
}

export interface SortAction {
  enable: keyof SortState;
  unable: keyof SortState;
}
