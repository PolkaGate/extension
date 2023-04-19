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

export function pascalCaseToTitleCase(str: string): string | undefined {
  if (!str) {
    return undefined;
  }

  // Replace all occurrences of capital letters with a space followed by the lowercase letter
  let result = str.replace(/([A-Z])/g, ' $1');

  // Replace underscores with spaces
  result = result.replace(/_/g, ' ');

  // Capitalize the first letter of each word
  result = result.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

  return result;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const elapsedMs = now.getTime() - date.getTime();

  const seconds = Math.round(elapsedMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days < 30) {
    return `${days} days ago`;
  } else {
    return `${months} months ago`;
  }
}
