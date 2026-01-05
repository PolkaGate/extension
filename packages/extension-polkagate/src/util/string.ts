// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { PalletConvictionVotingVoteVoting } from '@polkadot/types/lookup';

export const capitalizeFirstLetter = (str: string): string => str.replace(/^\w/, (c) => c.toUpperCase());

export function toSnakeCase (input: string | undefined): string | undefined {
  if (!input) {
    return undefined;
  }

  let output = input.trim().replace(/([a-z])([A-Z])/g, '$1_$2'); // Convert camelCase and PascalCase to snake_case

  output = output.replace(/\s+/g, '_'); // Replace whitespace with underscores
  output = output.toLowerCase(); // Convert all characters to lowercase

  return output;
}

export function convertToCamelCase (input: string): string {
  const parts = input.split(';');
  const camelCased = parts.map((part, index) =>
    index === 0 ? part : part.replace(/(?:^|-)(.)/g, (_, c) => c.toUpperCase())
  );

  return camelCased.join('');
}

export function toCamelCase (str: string): string {
  if (!str) {
    return '';
  }

  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => {
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  })?.replace(/\s+/g, '');
}

export function toPascalCase (input: string): string | undefined {
  if (!input) {
    return undefined;
  }

  // Replace underscores and hyphens with spaces
  let words = input.replace(/[_-]/g, ' ').split(' ');

  // Convert each word to title case
  words = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join words without spaces and return the Pascal case string
  return words.join('');
}

export function toTitleCase (input: string | undefined): string | undefined {
  if (!input) {
    return undefined;
  }

  // Replace all occurrences of capital letters with a space followed by the lowercase letter
  // Replace underscores and hyphens with spaces
  let words = input.replace(/([A-Z])/g, ' $1')?.replace(/[_-]/g, ' ')?.split(' ');

  // Convert each word to title case
  words = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join words with spaces and return the title case string
  return words.join(' ');
}

export function pascalCaseToTitleCase (str?: string): string | undefined {
  if (!str) {
    return undefined;
  }

  // Replace all occurrences of capital letters with a space followed by the lowercase letter
  let result = str.replace(/([A-Z])/g, ' $1');

  // Replace underscores with spaces
  result = result?.replace(/_/g, ' ');

  // Capitalize the first letter of each word
  result = result.split(' ').map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

  return result;
}

export function convertToHyphenated (str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

/**
 * Checks if the given string is a valid hex-encoded genesis hash.
 */
export function isValidGenesis (hash: string): boolean {
  return hash.startsWith('0x') && hash.length === 66;
}
