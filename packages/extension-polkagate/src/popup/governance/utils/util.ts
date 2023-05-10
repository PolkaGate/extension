// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN } from '@polkadot/util';

import { isAye, Vote } from '../post/myVote/util';

export function toSnakeCase(input: string | undefined): string | undefined {
  if (!input) {
    return undefined;
  }

  let output = input.replace(/([a-z])([A-Z])/g, '$1_$2'); // Convert camelCase and PascalCase to snake_case

  output = output.replace(/\s+/g, '_'); // Replace whitespace with underscores
  output = output.toLowerCase(); // Convert all characters to lowercase

  return output;
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
  words = words.map((word) => {
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

export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const elapsedMs = now.getTime() - date.getTime();

  const seconds = Math.round(elapsedMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(now.getMonth() - date.getMonth() + (12 * (now.getFullYear() - date.getFullYear())));

  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(months / 12);

    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

type BlockNumber = number | BN | undefined;

const DAY_BLOCK_COUNT = 24 * 60 * 10;
const HOUR_BLOCK_COUNT = 60 * 10;
const MINUTE_BLOCK_COUNT = 10;

export const blockToX = (block: BlockNumber, noUnit = false) => {
  if (!block) {
    return undefined;
  }

  const b = Number(block);
  const mayBeDays = b / DAY_BLOCK_COUNT;

  if (mayBeDays >= 1) {
    return `${mayBeDays}` + (!noUnit ? ` ${mayBeDays > 1 ? 'days' : 'day'}` : '');
  }

  const mayBeHours = b / HOUR_BLOCK_COUNT;

  if (mayBeHours >= 1) {
    return `${mayBeHours}` + (!noUnit ? ` ${mayBeHours > 1 ? 'hours' : 'hour'}` : '');
  }

  const mayBeMins = b / MINUTE_BLOCK_COUNT;

  if (mayBeMins >= 1) {
    return `${mayBeMins}` + (!noUnit ? ` ${mayBeMins > 1 ? 'mins' : 'min'}` : '');
  }
};

export const blockToUnit = (block: BlockNumber): string | undefined => {
  const b = block?.toNumber();

  if (!b) {
    return undefined;
  }

  const blocksPerDay = 24 * 60 * 10;
  const blocksPerHour = 60 * 10;
  const blocksPerMin = 10;
  const blocksPerUnit = {
    Day: blocksPerDay,
    Hour: blocksPerHour,
    Min: blocksPerMin
  };

  for (const [unit, blocks] of Object.entries(blocksPerUnit)) {
    if (Math.floor(b / blocks) > 0) {
      return unit;
    }
  }

  return undefined;
};

/** return the scale of a periodInBlock, which could be day, hour, or min in blocks */
export const getPeriodScale = (blockNumber: BlockNumber): number | undefined => {
  if (!blockNumber) {
    return undefined;
  }

  const blockCount = Number(blockNumber);

  const blocksInDays = blockCount / DAY_BLOCK_COUNT;

  if (blocksInDays >= 1) {
    return DAY_BLOCK_COUNT;
  }

  const blocksInHours = blockCount / HOUR_BLOCK_COUNT;

  if (blocksInHours >= 1) {
    return HOUR_BLOCK_COUNT;
  }

  const blocksInMinutes = blockCount / MINUTE_BLOCK_COUNT;

  if (blocksInMinutes >= 1) {
    return MINUTE_BLOCK_COUNT;
  }

  return undefined;
};

export const formalizedStatus = (status: string): string => {
  let output = status;

  switch (status) {
    case 'DecisionDepositPlaced':
      output = 'Preparing';
      break;

    case 'ConfirmStarted':
      output = 'Confirming';
      break;
  }

  return output;
}

export const getVoteType = (vote: Vote | null | undefined) => {
  if (vote) {
    if (vote?.standard?.vote) {
      return isAye(vote.standard.vote) ? 'Aye' : 'Nay';
    }

    if (vote?.splitAbstain?.abstain) {
      return 'Abstain';
    }

    if (vote?.delegating?.balance) {
      if (vote?.delegating?.aye) {
        return 'Aye';
      }

      if (vote?.delegating?.nay) {
        return 'Nay';
      }

      return 'Abstain';
    }
  }

  return undefined;
}