// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

export interface ItemInformation {
  collectionId?: string;
  itemId?: string;
  data?: string;
  isNft: boolean;
  isCreator: boolean;
  isOwner: boolean;
}

export interface FilterSectionProps {
  myUniquesDetails: ItemInformation[] | undefined;
  myNFTsDetails: ItemInformation[] | undefined;
  setItemsToShow: React.Dispatch<React.SetStateAction<ItemInformation[] | null | undefined>>;
}

export interface CheckboxButtonProps {
  title: string;
  checked: boolean;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

interface Attribute { label: string; value: string }

export interface ItemMetadata {
  animation_url?: string;
  name?: string | undefined;
  description?: string | undefined;
  image?: string | null | undefined;
  attributes: Attribute[] | undefined;
  tags: string[] | undefined;
}

export interface ItemProps {
  itemInformation: ItemInformation | undefined;
}

export interface ItemAvatarProp {
  image: string | null | undefined;
  height?: string;
  width?: string;
  onFullscreen?: () => void;
}

export interface FullscreenNftModalProps {
  image: string | null | undefined;
  onClose: () => void;
  open: boolean;
}

export interface DetailsProp {
  details: ItemMetadata;
  itemInformation: ItemInformation;
  show: boolean;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface DetailProp {
  title: string;
  text: string;
  inline?: boolean;
}
