// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

const trimValue = (value?: string | null): string | undefined => {
  const trimmed = value?.trim();

  return trimmed || undefined;
};

const hasAllowedWebProtocol = (value: string): boolean => /^(https?):\/\//i.test(value);

export const normalizeUrl = (value?: string | null): string | undefined => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return undefined;
  }

  if (hasAllowedWebProtocol(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const normalizeTwitterUrl = (value?: string | null): string | undefined => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return undefined;
  }

  if (hasAllowedWebProtocol(trimmed)) {
    return trimmed;
  }

  return `https://twitter.com/${trimmed.replace(/^@/, '')}`;
};

export const normalizeGithubUrl = (value?: string | null): string | undefined => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return undefined;
  }

  if (hasAllowedWebProtocol(trimmed)) {
    return trimmed;
  }

  return `https://github.com/${trimmed.replace(/^@/, '')}`;
};

export const normalizeMatrixUrl = (value?: string | null): string | undefined => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return undefined;
  }

  if (hasAllowedWebProtocol(trimmed)) {
    return trimmed;
  }

  return `https://matrix.to/#/${trimmed}`;
};

export const normalizeDiscordUrl = (value?: string | null): string | undefined => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return undefined;
  }

  if (hasAllowedWebProtocol(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('discord.gg/') || trimmed.startsWith('discord.com/')) {
    return `https://${trimmed}`;
  }

  return undefined;
};

export const normalizeMailtoUrl = (value?: string | null): string | undefined => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return undefined;
  }

  return trimmed.toLowerCase().startsWith('mailto:') ? trimmed : `mailto:${trimmed}`;
};
