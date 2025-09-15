// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Theme } from '@mui/material';
import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Text } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { Compact, u128 } from '@polkadot/types-codec';
import type { HexString } from '@polkadot/util/types';
import type { SavedAssets } from '../hooks/useAssetsBalances';
import type { DropdownOption, FastestConnectionType, TransactionDetail, UserAddedChains } from './types';

import { BN, BN_TEN, BN_THOUSAND, BN_TWO, BN_ZERO, bnMax, bnMin, hexToBn, hexToString, hexToU8a, isHex, stringToU8a, u8aToHex, u8aToString } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { EXTRA_PRICE_IDS } from './api/getPrices';
import { fastestEndpoint } from './workers/utils';
import allChains from './chains';
import { ASSET_HUBS, BLOCK_RATE, FLOATING_POINT_DIGIT, PROFILE_COLORS, RELAY_CHAINS_GENESISHASH, SHORT_ADDRESS_CHARACTERS, WESTEND_GENESIS_HASH } from './constants';
import { isMigrated, isMigratedHub } from './migrateHubUtils';

interface Meta {
  docs: Text[];
}

export const upperCaseFirstChar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function isValidAddress (address: string | undefined): boolean {
  try {
    if (!address || address === 'undefined') {
      return false;
    }

    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : decodeAddress(address)
    );

    return true;
  } catch {
    return false;
  }
}

function countLeadingZerosInFraction (numStr: string) {
  const match = numStr.match(/\.(0+)/);

  if (match) {
    return match[1].length;
  }

  return 0;
}

export function countDecimalPlaces (n: number) {
  const match = n.toString().match(/\.(\d+)/);

  return match ? match[1].length : 0;
}

export function getDecimal (n: string | number, count = 2) {
  const decimalPart = n.toString().split('.')[1];

  return decimalPart ? decimalPart.slice(0, count) : 0;
}

export function formatDecimal (_number: number | string, decimalDigit = FLOATING_POINT_DIGIT, commify?: boolean, dynamicDecimal?: boolean): string {
  const MAX_DECIMAL_POINTS = 6;

  // make number positive if it is negative
  const sNumber = Number(_number) < 0 ? String(-Number(_number)) : String(_number);

  const dotIndex = sNumber.indexOf('.');

  if (dotIndex < 0) {
    return sNumber;
  }

  let integerDigits = sNumber.slice(0, dotIndex);

  if (integerDigits === '0' && dynamicDecimal) { // to show very small numbers such as 0.0000001123
    const leadingZerosInFraction = countLeadingZerosInFraction(sNumber);

    if (leadingZerosInFraction > 0 && leadingZerosInFraction < MAX_DECIMAL_POINTS) {
      decimalDigit = leadingZerosInFraction + 1;
    }
  }

  const fractionalDigits = decimalDigit === 0 ? '' : sNumber.slice(dotIndex, dotIndex + decimalDigit + 1);

  integerDigits = commify ? Number(integerDigits).toLocaleString() : integerDigits;

  return integerDigits + fractionalDigits;
}

export const toHuman = (api: ApiPromise, value: unknown) => api.createType('Balance', value).toHuman();

/**
 * Converts scientific notation to decimal string
 * @param {string|number} value - e.g., "1e-7" or 2.5e-8
 * @returns {string} decimal representation
 */
export function sciToDecimal (value: string | number) {
  const str = value.toString();

  // Check if it’s scientific notation
  if (!/e/i.test(str)) {
    return str;
  }

  const [base, exp] = str.toLowerCase().split('e');
  let [intPart, fracPart = ''] = base.split('.');
  const exponent = parseInt(exp, 10);

  if (exponent > 0) {
    // Shift decimal to the right
    const shift = exponent - fracPart.length;

    fracPart = fracPart + '0'.repeat(Math.max(shift, 0));

    return intPart + fracPart;
  } else {
    // Shift decimal to the left
    return '0.' + '0'.repeat(Math.abs(exponent) - 1) + intPart + fracPart;
  }
}

export function amountToHuman (_amount: string | number | BN | bigint | Compact<u128> | undefined, _decimals: number | undefined, decimalDigits?: number, commify?: boolean): string {
  if (!_amount || !_decimals) {
    return '';
  }

  _amount = String(_amount).replace(/,/g, '');

  const x = 10 ** _decimals;

  return formatDecimal(Number(_amount) / x, decimalDigits, commify);
}

export function amountToMachine (amount: string | undefined, decimal: number | undefined): BN {
  if (!amount || !Number(amount) || !decimal) {
    return BN_ZERO;
  }

  try {
    const _amount = sciToDecimal(amount);
    const dotIndex = _amount.indexOf('.');
    let newAmount = _amount;

    if (dotIndex >= 0) {
      const wholePart = _amount.slice(0, dotIndex);
      const fractionalPart = _amount.slice(dotIndex + 1);

      newAmount = wholePart + fractionalPart;
      decimal -= fractionalPart.length;

      if (decimal < 0) {
        throw new Error("decimal should be more than amount's decimals digits");
      }
    }

    return new BN(newAmount).mul(BN_TEN.pow(new BN(decimal)));
  } catch (e) {
    console.error('Something went wrong when converting amount to machine:', e);

    return BN_ZERO;
  }
}

export function getFormattedAddress (_address: string | null | undefined, _chain: Chain | null | undefined, settingsPrefix: number): string {
  const publicKey = decodeAddress(_address);
  const prefix = _chain ? _chain.ss58Format : (settingsPrefix === -1 ? 42 : settingsPrefix);

  return encodeAddress(publicKey, prefix);
}

export function getSubstrateAddress (address: AccountId | string | null | undefined): string | undefined {
  if (!address) {
    return undefined;
  }

  let substrateAddress;

  // eslint-disable-next-line no-useless-catch
  try {
    const publicKey = decodeAddress(address, true);

    substrateAddress = encodeAddress(publicKey, 42);
  } catch (e) {
    console.log(e);

    return undefined;
  }

  return substrateAddress;
}

export const accountName = (accounts: AccountJson[], address: string | undefined): string | undefined => {
  if (!accounts.length || !address) {
    return undefined;
  }

  const addr = getSubstrateAddress(address);

  return accounts.find((acc) => acc.address === addr)?.name;
};

export function prepareMetaData (chain: Chain | null | string, label: string, metaData: unknown): string {
  const chainName = sanitizeChainName((chain as Chain)?.name) ?? chain;

  if (label === 'balances') {
    const { balances, decimals, tokens } = metaData as { balances: DeriveBalancesAll, tokens: string[], decimals: number[] };

    metaData = {
      availableBalance: balances.availableBalance.toString(),
      decimals,
      freeBalance: balances.freeBalance.toString(),
      // frozenFee: balances.frozenFee.toString(),
      // frozenMisc: balances.frozenMisc.toString(),
      lockedBalance: balances.lockedBalance.toString(),
      reservedBalance: balances.reservedBalance.toString(),
      tokens,
      vestedBalance: balances.vestedBalance.toString(),
      vestedClaimable: balances.vestedClaimable.toString(),
      votingBalance: balances.votingBalance.toString()
    };
  }

  return JSON.stringify({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    [label]: JSON.stringify({ chainName, metaData })
  });
}

export const getWebsiteFavicon = (url: string | undefined): string => {
  if (!url) {
    return '';
  }

  return 'https://s2.googleusercontent.com/s2/favicons?domain=' + url;
};

export function remainingTime (blocks: number, noMinutes?: boolean): string {
  let mins = Math.floor(blocks * BLOCK_RATE / 60);

  if (!mins) {
    return '';
  }

  if (mins <= 0) {
    return 'finished';
  }

  let hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  let time = '';

  mins -= hrs * 60;

  if (!(noMinutes && days) && mins) {
    time += mins + ' mins ';
  }

  hrs -= days * 24;

  if (hrs === 1) {
    time = hrs + ' hour ' + time;
  }

  if (hrs && hrs !== 1) {
    time = hrs + ' hours ' + time;
  }

  if (days === 1) {
    time = days + ' day ' + time;
  }

  if (days && days !== 1) {
    time = days + ' days ' + time;
  }

  return time;
}

export function remainingTimeCountDown (seconds: number | undefined): string {
  if (!seconds || seconds <= 0) {
    return 'finished';
  }

  const days = Math.floor(seconds / (60 * 60 * 24));
  const [hour, min, sec] = new Date(seconds * 1000).toISOString().substring(11, 19).split(':');

  const d = days ? `${days} day ` : '';
  const h = hour ? `${hour} hour ` : '';
  const m = min ? `${min} min ` : '';
  const s = sec ? `${sec} sec` : '';

  return d + h + m + s;
}

function splitSingle (value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts (value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}

export function formatMeta (meta?: Meta): string[] | null {
  if (!meta?.docs.length) {
    return null;
  }

  const strings = meta.docs.map((d) => d.toString().trim());
  const firstEmpty = strings.findIndex((d) => !d.length);
  const combined = (
    firstEmpty === -1
      ? strings
      : strings.slice(0, firstEmpty)
  ).join(' ').replace(/#(<weight>| <weight>).*<\/weight>/, '');
  const parts = splitParts(combined.replace(/\\/g, '').replace(/`/g, ''));

  return parts;
}

export function toShortAddress (address?: string | AccountId, count = SHORT_ADDRESS_CHARACTERS): string {
  if (!address) {
    return '';
  }

  address = String(address);

  return `${address.slice(0, count)}...${address.slice(-1 * count)}`;
}

export const isEqual = (a1: unknown[] | null, a2: unknown[] | null): boolean => {
  if (!a1 && !a2) {
    return true;
  }

  if (!(a1 || a2)) {
    return false;
  }

  const a1Sorted = a1?.slice().sort();
  const a2Sorted = a2?.slice().sort();

  return JSON.stringify(a1Sorted) === JSON.stringify(a2Sorted);
};

export function saveAsHistory (formatted: string, info: TransactionDetail) {
  chrome.storage.local.get('history', (res) => {
    const k = `${formatted}`;
    const last = (res?.['history'] ?? {}) as unknown as Record<string, TransactionDetail[]>;

    if (last[k]) {
      last[k].push(info);
    } else {
      last[k] = [info];
    }

    // eslint-disable-next-line no-void
    void chrome.storage.local.set({ history: last });
  });
}

export async function getHistoryFromStorage (formatted: string): Promise<TransactionDetail[] | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get('history', (res) => {
      const k = `${formatted}`;
      const last = (res?.['history'] ?? {}) as unknown as Record<string, TransactionDetail[]>;

      resolve(last?.[k]);
    });
  });
}

export const isHexToBn = (i: string): BN => isHex(i) ? hexToBn(i) : new BN(i);
export const toBN = (i: unknown): BN => isHexToBn(String(i));

export const sanitizeChainName = (chainName: string | undefined, withMigration?: boolean) => {
  if (!chainName) {
    return chainName;
  }

  let sanitizedChainName = chainName
    .replace(' Relay Chain', '')
    .replace(' Network', '')
    .replace(' chain', '')
    .replace(' Chain', '')
    .replace(' Finance', '')
    .replace(' Testnet', '')
    .replace(/\s/g, '');

  sanitizedChainName = withMigration && isMigratedHub(sanitizedChainName)
    ? sanitizedChainName.replace('AssetHub', '')
    : sanitizedChainName;

  return sanitizedChainName;
};

export const isEmail = (input: string | undefined) => {
  if (!input) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(input);
};

export const isUrl = (input: string | undefined) => {
  if (!input) {
    return false;
  }

  const urlRegex = /^(https?:\/\/)?([\w\d]+\.)+[\w\d]{2,6}(\/[\w\d]+)*$/;

  return urlRegex.test(input);
};

export const isWss = (input: string | undefined): boolean => {
  if (!input) {
    return false;
  }

  const urlRegex = /^wss:\/\/([\w\d-]+\.)+[\w\d-]{2,}(:\d+)?(\/[\w\d\-._~:/?#\[\]@!$&'()*+,;=]*)?$/i;

  return urlRegex.test(input);
};

export const pgBoxShadow = (theme: Theme): string => theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '2px 3px 4px 0px rgba(0, 0, 0, 0.10)';

export const truncString32Bytes = (input: string | null | undefined): string | null | undefined => {
  if (!input) {
    return input;
  }

  const encoder = new TextEncoder();
  let byteLength = encoder.encode(input).length;
  let inputVal = input;

  while (byteLength > 32) {
    inputVal = inputVal.substring(0, inputVal.length - 1);
    byteLength = encoder.encode(inputVal).length;
  }

  return inputVal;
};

export const isOnRelayChain = (genesisHash?: string) => RELAY_CHAINS_GENESISHASH.includes(genesisHash || '');

export const isOnAssetHub = (genesisHash?: string) => ASSET_HUBS.includes(genesisHash || '');

export const getProfileColor = (index: number, theme: Theme): string => {
  if (index >= 0) {
    const _index = index % PROFILE_COLORS.length; // to return colors recursively

    return PROFILE_COLORS[_index][theme.palette.mode];
  }

  return PROFILE_COLORS[0][theme.palette.mode];
};

export const getPriceIdByChainName = (chainName?: string, useAddedChains?: UserAddedChains) => {
  if (!chainName) {
    return '';
  }

  if (useAddedChains) {
    const maybeUserAddedPriceId = Object.entries(useAddedChains).find(([_, { chain }]) => chain?.replace(/\s/g, '')?.toLowerCase() === chainName.toLowerCase())?.[1]?.priceId;

    if (maybeUserAddedPriceId) {
      return maybeUserAddedPriceId;
    }
  }

  const _chainName = (sanitizeChainName(chainName) as unknown as string).toLocaleLowerCase();

  return EXTRA_PRICE_IDS[_chainName] ||
    _chainName?.replace('assethub', '')?.replace('people', '');
};

export function areArraysEqual<T> (arrays: T[][]): boolean {
  if (arrays.length < 2) {
    return true; // Single array or empty input is considered equal
  }

  const referenceArrayLength = arrays[0].length;

  // Check if all inputs are arrays of the same length
  const allValidArrays = arrays.every((arr) => Array.isArray(arr) && arr.length === referenceArrayLength);

  if (!allValidArrays) {
    return false;
  }

  // Create sorted copies of the arrays
  const sortedArrays = arrays.map((arr) => arr.sort());

  // Compare each sorted array with the first sorted array
  return sortedArrays.every((s) =>
    s.every((element, index) => element === sortedArrays[0][index])
  );
}

export function extractBaseUrl (url: string | undefined) {
  try {
    if (!url) {
      return;
    }

    const urlObj = new URL(url);

    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    console.error('Invalid URL:', error);

    return null;
  }
}

export async function fastestConnection (endpoints: DropdownOption[]): Promise<FastestConnectionType> {
  try {
    const urls = endpoints.map(({ value }) => ({ value: value as string }));
    const { api, connections } = await fastestEndpoint(urls);

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const selectedEndpoint = api.registry.knownTypes.provider.endpoint as string;
    const connectionsToDisconnect = connections.filter(({ wsProvider }) => wsProvider.endpoint !== selectedEndpoint);

    connectionsToDisconnect.forEach(({ wsProvider }) => {
      wsProvider.disconnect().catch(console.error);
    });

    return {
      api,
      selectedEndpoint
    };
  } catch (error) {
    console.error('Unable to make an API connection!', error);

    return {
      api: undefined,
      selectedEndpoint: undefined
    };
  }
}

export const encodeMultiLocation = (multiLocation: unknown) => {
  try {
    const jsonString = JSON.stringify(multiLocation);
    const u8aArray = stringToU8a(jsonString);
    const hexString = u8aToHex(u8aArray);

    return hexString;
  } catch (error) {
    console.error('Error encoding multiLocation:', error);

    return null;
  }
};

export const decodeHexValues = (obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const objAsRecord = { ...obj } as Record<string, any>;

  Object.keys(objAsRecord).forEach((key) => {
    if (typeof objAsRecord[key] === 'string' && objAsRecord[key].startsWith('0x')) {
      objAsRecord[key] = hexToString(objAsRecord[key]);
    }
  });

  if ('interior' in objAsRecord && 'x1' in objAsRecord['interior']) {
    objAsRecord['interior'].x1 = [objAsRecord['interior'].x1];
  }

  return objAsRecord;
};

export const decodeMultiLocation = (hexString: HexString) => {
  const decodedU8a = hexToU8a(hexString);
  const decodedJsonString = u8aToString(decodedU8a);
  let decodedMultiLocation: unknown;

  try {
    decodedMultiLocation = JSON.parse(decodedJsonString);
  } catch (error) {
    console.error('Error parsing JSON string in decodeMultiLocation, using the asset id as is:', error);

    return hexString;
  }

  return decodeHexValues(decodedMultiLocation);
};

export const addressToChain = (address: string) => {
  if (!isValidAddress(address)) {
    console.log('Not a valid address');

    return null;
  }

  if (getSubstrateAddress(address) === address) {
    return {
      chainName: 'Westend',
      genesisHash: WESTEND_GENESIS_HASH
    };
  }

  const publicKey = decodeAddress(address, true);

  const chain = allChains.find(({ ss58Format }) => encodeAddress(publicKey, ss58Format) === address);

  return {
    chainName: chain?.chain,
    genesisHash: chain?.genesisHash
  };
};

/**
 * Format options for the timestamp display
 */
export type TimestampPart = 'weekday' | 'month' | 'day' | 'year' | 'hours' | 'minutes' | 'seconds' | 'ampm';

/**
 * Formats a timestamp with customizable output based on the parts you want to include.
 *
 * @param {number|string|Date} timestamp - The timestamp to format. Can be:
 *   - number: milliseconds since epoch (e.g., 1723026480000)
 *   - string: a date string parsable by the Date constructor (e.g., "2024-08-06T19:48:00")
 *   - Date: a JavaScript Date object
 *
 * @param {TimestampPart[] | undefined} [parts] - Array of timestamp parts to include in the output:
 *   - If undefined or empty, returns the full formatted date
 *   - Available parts: 'weekday', 'month', 'day', 'year', 'hours', 'minutes', 'seconds', 'ampm'
 *
 * @param {string} [separator=", "] - The separator to use between parts
 *
 * @returns {string} The formatted date string including only the specified parts
 *
 * @example
 * // Returns something like "Tue, Aug 6, 2024, 7:48:00 PM"
 * formatTimestamp(1723026480000);
 *
 * @example
 * // Returns something like "Aug 6 7"
 * formatTimestamp(1723026480000, ['month', 'day', 'hours']);
 *
 * @example
 * // Returns something like "Aug-6-2024"
 * formatTimestamp(1723026480000, ['month', 'day', 'year'], '-');
 */
export function formatTimestamp (
  timestamp: number | string | Date,
  parts?: TimestampPart[]
): string {
  const date = new Date(timestamp);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const components: Record<TimestampPart, string | number> = {
    ampm: date.getHours() >= 12 ? 'PM' : 'AM',
    day: date.getDate(),
    hours: date.getHours() % 12 || 12,
    minutes: date.getMinutes().toString().padStart(2, '0'),
    month: months[date.getMonth()],
    seconds: date.getSeconds().toString().padStart(2, '0'),
    weekday: weekdays[date.getDay()],
    year: date.getFullYear()
  };

  if (!parts || parts.length === 0) {
    // Default full date-time
    return `${components.weekday}, ${components.month} ${components.day}, ${components.year}, ${components.hours}:${components.minutes}:${components.seconds} ${components.ampm}`;
  }

  const dateParts: string[] = [];
  const timeParts: string[] = [];

  parts.forEach((part) => {
    if (['weekday', 'month', 'day', 'year'].includes(part)) {
      if (part === 'month' && parts.includes('day')) {
        // Let 'month' and 'day' group together like "Apr 13"
        if (!dateParts.includes(`${components.month} ${components.day}`)) {
          dateParts.push(`${components.month} ${components.day}`);
        }
      } else if (part === 'day' && parts.includes('month')) {
        // Already handled above
      } else {
        dateParts.push(String(components[part]));
      }
    } else {
      // time parts
      timeParts.push(part);
    }
  });

  // Format time block smartly
  let timeString = '';

  if (timeParts.length > 0) {
    const hours = timeParts.includes('hours') ? components.hours : '';
    const minutes = timeParts.includes('minutes') ? `:${components.minutes}` : '';
    const seconds = timeParts.includes('seconds') ? `:${components.seconds}` : '';
    const ampm = timeParts.includes('ampm') ? ` ${components.ampm}` : '';

    timeString = `${hours}${minutes}${seconds}${ampm}`.trim();
  }

  if (dateParts.length > 0 && timeString) {
    return `${dateParts.join(' ')}, ${timeString}`;
  } else if (dateParts.length > 0) {
    return dateParts.join(' ');
  } else {
    return timeString;
  }
}

export function blockToDate (blockNumber?: number, currentBlock?: number, option?: Intl.DateTimeFormatOptions, iso?: boolean) {
  if (!blockNumber || !currentBlock) {
    return 'N/A';
  }

  let date;

  if (blockNumber >= currentBlock) {
    const time = (blockNumber - currentBlock) * 6000;
    const now = Date.now();

    date = new Date(now + time);
  } else {
    const diff = (currentBlock - blockNumber) * 6000;
    const now = Date.now();

    date = new Date(now - diff);
  }

  if (iso) {
    return date.toISOString();
  }

  return date.toLocaleDateString('en-US', option ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

// Remove zero balance records
export const removeZeroBalanceRecords = (toBeSavedAssets: SavedAssets): SavedAssets => {
  const _toBeSavedAssets = { ...toBeSavedAssets };
  const balances = (_toBeSavedAssets)?.balances || [];

  Object.entries(balances).forEach(([address, assetsPerChain]) => {
    Object.entries(assetsPerChain).forEach(([genesisHash, fetchedBalance]) => {
      const toBeDeletedIndexes: string[] = [];

      fetchedBalance.forEach(({ token, totalBalance }) => {
        if (new BN(totalBalance).isZero()) {
          toBeDeletedIndexes.push(token);
        }
      });
      toBeDeletedIndexes.forEach((_token) => {
        const index = _toBeSavedAssets.balances[address][genesisHash].findIndex(({ token }) => _token === token);

        index >= 0 && _toBeSavedAssets.balances[address][genesisHash].splice(index, 1);
      });

      if (!_toBeSavedAssets.balances[address][genesisHash].length) {
        delete _toBeSavedAssets.balances[address][genesisHash];
      }
    });
  });

  return _toBeSavedAssets;
};

export const getSubscanChainName = (chainName?: string): string | undefined => {
  if (!chainName) {
    return;
  }

  const lc = chainName.toLowerCase();

  if (lc.includes('assethub') || isMigrated(lc)) {
    // if already has 'assethub' at the end → reorder
    if (/(.*)assethub$/.test(lc)) {
      return lc.replace(/^(.*)assethub$/, 'assethub-$1');
    }

    // if it’s just the relay (westend, polkadot, paseo, etc.)
    return `assethub-${lc}`;
  }

  if (lc.includes('people')) {
    return lc.replace(/^(.*)people$/, 'people-$1');
  }

  return lc;
};

export const safeSubtraction = (subtraction: BN, preferredMin = BN_ZERO) => {
  return bnMax(preferredMin, subtraction);
};

// Some chains incorrectly use these, i.e. it is set to values such as 0 or even 2
// Use a low minimum validity threshold to check these against
const THRESHOLD = BN_THOUSAND.div(BN_TWO);
const DEFAULT_TIME = new BN(6_000);
const A_DAY = new BN(24 * 60 * 60 * 1000);

export function calcInterval (api: ApiPromise | undefined): BN {
  if (!api) {
    return DEFAULT_TIME;
  }

  return bnMin(A_DAY, (
    // Babe, e.g. Relay chains (Substrate defaults)
    api.consts['babe']?.['expectedBlockTime'] as unknown as BN ||
    // POW, eg. Kulupu
    api.consts['difficulty']?.['targetBlockTime'] as unknown as BN ||
    // Subspace
    // Subspace
    api.consts['subspace']?.['expectedBlockTime'] || (
      // Check against threshold to determine value validity
      (api.consts['timestamp']?.['minimumPeriod'] as unknown as BN).gte(THRESHOLD)
        // Default minimum period config
        ? (api.consts['timestamp']['minimumPeriod'] as unknown as BN).mul(BN_TWO)
        : api.query['parachainSystem']
          // default guess for a parachain
          ? DEFAULT_TIME.mul(BN_TWO)
          // default guess for others
          : DEFAULT_TIME
    )
  ));
}

export const calcPrice = (assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal) || '0') * (assetPrice ?? 0);

export const calcChange = (tokenPrice: number, tokenBalance: number, tokenPriceChange: number) => {
  if (tokenPriceChange === -100) {
    return 0;
  }

  const totalChange = (tokenPriceChange * tokenBalance) / 100;

  return totalChange * tokenPrice;
};
