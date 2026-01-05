// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function removeProfileTag(profile: string | undefined, tagToRemove: string): string {
  if (!profile) {
    return '';
  }

  return profile
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== tagToRemove)
    .join(',');
}

export function addProfileTag(profile: string | undefined, tagToAdd: string): string {
  if (!tagToAdd.trim()) {
    return profile ?? '';
  }

  const tags = (profile ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  if (tags.includes(tagToAdd)) {
    return tags.join(',');
  }

  tags.push(tagToAdd);

  return tags.join(',');
}
