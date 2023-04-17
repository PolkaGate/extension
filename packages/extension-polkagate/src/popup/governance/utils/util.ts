// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function toSnakeCase(input: string): string | undefined {
  if (!input) {
    return undefined;
  }

  // Replace spaces with underscores
  let words = input.replace(/\s+/g, '_');

  // Replace camelCase with snake_case
  words = words.replace(/([a-z])([A-Z])/g, '$1_$2');

  // Convert the string to lowercase and return the snake_case string
  return words.toLowerCase();
}

export function toPascalCase(input: string): string | undefined {
  if (!input) {
    return undefined;
  }

  // Replace underscores and hyphens with spaces
  let words = input.replace(/[_-]/g, ' ').split(' ');

  // Convert each word to title case
  words = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join words without spaces and return the Pascal case string
  return words.join('');
}

export function toTitleCase(input: string): string | undefined {
  if (!input) {
    return undefined;
  }

  // Replace underscores and hyphens with spaces
  let words = input.replace(/[_-]/g, ' ').split(' ');

  // Convert each word to title case
  words = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join words with spaces and return the title case string
  return words.join(' ');
}
