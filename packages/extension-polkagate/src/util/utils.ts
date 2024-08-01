// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Theme } from '@mui/material';
import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Text } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { Compact, u128 } from '@polkadot/types-codec';
import type { SavedMetaData, TransactionDetail } from './types';

import { BN, BN_TEN, BN_ZERO, hexToBn, hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { EXTRA_PRICE_IDS } from './api/getPrices';
import { ASSET_HUBS, BLOCK_RATE, FLOATING_POINT_DIGIT, PROFILE_COLORS, RELAY_CHAINS_GENESISHASH, SHORT_ADDRESS_CHARACTERS } from './constants';

interface Meta {
  docs: Text[];
}

export const upperCaseFirstChar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function isValidAddress(_address: string | undefined): boolean {
  try {
    encodeAddress(
      isHex(_address)
        ? hexToU8a(_address)
        : decodeAddress(_address)
    );

    return true;
  } catch (error) {
    return false;
  }
}

export function fixFloatingPoint(_number: number | string, decimalDigit = FLOATING_POINT_DIGIT, commify?: boolean): string {
  // make number positive if it is negative
  const sNumber = Number(_number) < 0 ? String(-Number(_number)) : String(_number);

  const dotIndex = sNumber.indexOf('.');

  if (dotIndex < 0) {
    return sNumber;
  }

  let integerDigits = sNumber.slice(0, dotIndex);

  integerDigits = commify ? Number(integerDigits).toLocaleString() : integerDigits;
  const fractionalDigits = sNumber.slice(dotIndex, dotIndex + decimalDigit + 1);

  return integerDigits + fractionalDigits;
}

export const toHuman = (api: ApiPromise, value: unknown) => api.createType('Balance', value).toHuman();

export function amountToHuman(_amount: string | number | BN | bigint | Compact<u128> | undefined, _decimals: number | undefined, decimalDigits?: number, commify?: boolean): string {
  if (!_amount || !_decimals) {
    return '';
  }

  _amount = String(_amount).replace(/,/g, '');

  const x = 10 ** _decimals;

  return fixFloatingPoint(Number(_amount) / x, decimalDigits, commify);
}

export function amountToMachine(amount: string | undefined, decimal: number | undefined): BN {
  if (!amount || !Number(amount) || !decimal) {
    return BN_ZERO;
  }

  const dotIndex = amount.indexOf('.');
  let newAmount = amount;

  if (dotIndex >= 0) {
    const wholePart = amount.slice(0, dotIndex);
    const fractionalPart = amount.slice(dotIndex + 1);

    newAmount = wholePart + fractionalPart;
    decimal -= fractionalPart.length;

    if (decimal < 0) {
      throw new Error("decimal should be more than amount's decimals digits");
    }
  }

  return new BN(newAmount).mul(BN_TEN.pow(new BN(decimal)));
}

export function getFormattedAddress(_address: string | null | undefined, _chain: Chain | null | undefined, settingsPrefix: number): string {
  const publicKey = decodeAddress(_address);
  const prefix = _chain ? _chain.ss58Format : (settingsPrefix === -1 ? 42 : settingsPrefix);

  return encodeAddress(publicKey, prefix);
}

export function getSubstrateAddress(address: AccountId | string | null | undefined): string | undefined {
  if (!address) {
    return undefined;
  }

  let publicKey;

  // eslint-disable-next-line no-useless-catch
  try {
    publicKey = decodeAddress(address, true);
  } catch (e) {
    console.log(e);

    return undefined;
  }

  return encodeAddress(publicKey, 42);
}

export const accountName = (accounts: AccountJson[], address: string | undefined): string | undefined => {
  if (!accounts.length || !address) {
    return undefined;
  }

  const addr = getSubstrateAddress(address);

  return accounts.find((acc) => acc.address === addr)?.name;
};

export function prepareMetaData(chain: Chain | null | string, label: string, metaData: any): string {
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

export function getTransactionHistoryFromLocalStorage(
  chain: Chain | null,
  hierarchy: AccountWithChildren[],
  address: string,
  _chainName?: string): TransactionDetail[] {
  const accountSubstrateAddress = getSubstrateAddress(address);

  const account = hierarchy.find((h) => h.address === accountSubstrateAddress);

  if (!account) {
    console.log('something went wrong while looking for the account in accounts!!');

    return [];
  }

  const chainName = chain ? sanitizeChainName(chain.name) : _chainName;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let transactionHistoryFromLocalStorage: SavedMetaData | null = null;
  try {
    transactionHistoryFromLocalStorage = account?.['history'] ? JSON.parse(String(account['history'])) : null;
  } catch (error) {
    console.error('Failed to parse transaction history:', error);
  }


  if (transactionHistoryFromLocalStorage) {
    if (transactionHistoryFromLocalStorage.chainName === chainName) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return transactionHistoryFromLocalStorage.metaData;
    }
  }

  return [];
}

export const getWebsiteFavicon = (url: string | undefined): string => {
  if (!url) {
    return '';
  }

  return 'https://s2.googleusercontent.com/s2/favicons?domain=' + url;
};

export function remainingTime(blocks: number, noMinutes?: boolean): string {
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

export function remainingTimeCountDown(seconds: number | undefined): string {
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

function splitSingle(value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts(value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}

export function formatMeta(meta?: Meta): string[] | null {
  if (!meta || !meta.docs.length) {
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

export function toShortAddress(address: string | AccountId, count = SHORT_ADDRESS_CHARACTERS): string {
  address = String(address);

  return `${address.slice(0, count)}...${address.slice(-1 * count)}`;
}

export const isEqual = (a1: any[] | null, a2: any[] | null): boolean => {
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

export function saveAsHistory(formatted: string, info: TransactionDetail) {
  chrome.storage.local.get('history', (res) => {
    const k = `${formatted}` as any;
    const last = (res?.['history'] ?? {}) as unknown as { [key: string]: TransactionDetail[] };

    if (last[k]) {
      last[k].push(info);
    } else {
      last[k] = [info];
    }

    // eslint-disable-next-line no-void
    void chrome.storage.local.set({ history: last });
  });
}

export async function getHistoryFromStorage(formatted: string): Promise<TransactionDetail[] | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get('history', (res) => {
      const k = `${formatted}` as any;
      const last = (res?.['history'] ?? {}) as unknown as { [key: string]: TransactionDetail[] };


      resolve(last?.[k]);
    });
  });
}

export const isHexToBn = (i: string): BN => isHex(i) ? hexToBn(i) : new BN(i);
export const toBN = (i: any): BN => isHexToBn(String(i));

export const sanitizeChainName = (chainName: string | undefined) => (chainName?.replace(' Relay Chain', '')?.replace(' Network', '')?.replace(' chain', '')?.replace(' Chain', '')?.replace(' Finance', '')?.replace(' Testnet', '')?.replace(/\s/g, ''));

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

export const pgBoxShadow = (theme: Theme): string => theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '2px 3px 4px 0px rgba(0, 0, 0, 0.10)';

export const noop = () => null;

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

export const getPriceIdByChainName = (chainName?: string) => {
  if (!chainName) {
    return '';
  }

  const _chainName = (sanitizeChainName(chainName) as string).toLocaleLowerCase();

  return EXTRA_PRICE_IDS[_chainName] ||
    _chainName?.replace('assethub', '')?.replace('people', '');
};
