// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, u128 } from '@polkadot/types-codec';

import { BN, BN_TEN, BN_ZERO, bnMax, hexToBn, isHex } from '@polkadot/util';

import { FLOATING_POINT_DIGIT } from './constants';

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

export const isHexToBn = (i: string): BN => isHex(i) ? hexToBn(i) : new BN(i);
export const toBN = (i: unknown): BN => isHexToBn(String(i));

export const calcPrice = (assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal) || '0') * (assetPrice ?? 0);

export const calcChange = (tokenPrice: number, tokenBalance: number, tokenPriceChange: number) => {
  if (tokenPriceChange === -100) {
    return 0;
  }

  const totalChange = (tokenPriceChange * tokenBalance) / 100;

  return totalChange * tokenPrice;
};

export const safeSubtraction = (subtraction: BN, preferredMin = BN_ZERO) => {
  return bnMax(preferredMin, subtraction);
};
