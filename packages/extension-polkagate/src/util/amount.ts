// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, u128 } from '@polkadot/types-codec';

import { BN, BN_TEN, BN_ZERO, bnMax, hexToBn, isHex } from '@polkadot/util';

import { FLOATING_POINT_DIGIT } from './constants';

/**
 * Counts the number of leading zeros in the fractional part of a decimal number.
 *
 * @param {string} numStr - The number in string format.
 * @returns {number} The count of leading zeros in the fractional part.
 *
 * @example
 * countLeadingZerosInFraction("0.00045"); // 3
 * countLeadingZerosInFraction("123.0045"); // 2
 * countLeadingZerosInFraction("10.45"); // 0
 * countLeadingZerosInFraction("42"); // 0
 */
function countLeadingZerosInFraction(numStr: string) {
  const match = numStr.match(/\.(0+)/);

  if (match) {
    return match[1].length;
  }

  return 0;
}

/**
 * Counts the number of decimal places in a given number.
 *
 * @param {number} n - The number to check.
 * @returns {number} The count of decimal places.
 *
 * @example
 * countDecimalPlaces(12.345); // 3
 * countDecimalPlaces(100.5); // 1
 * countDecimalPlaces(42); // 0
 * countDecimalPlaces(0.0001); // 4
 */
export function countDecimalPlaces(n: number) {
  const match = n.toString().match(/\.(\d+)/);

  return match ? match[1].length : 0;
}

/**
 * Retrieves the decimal portion of a number or string, limited to a specified number of digits.
 *
 * @param {string | number} n - The number or numeric string to extract decimals from.
 * @param {number} [count=2] - The maximum number of decimal places to return.
 * @returns {string | number} The extracted decimal portion, or 0 if no decimal part exists.
 *
 * @example
 * getDecimal(12.3456, 2); // "34"
 * getDecimal("100.98765", 3); // "987"
 * getDecimal(42); // 0
 * getDecimal("0.0001", 2); // "00"
 */
export function getDecimal(n: string | number, count = 2) {
  const decimalPart = n.toString().split('.')[1];

  return decimalPart ? decimalPart.slice(0, count) : 0;
}

/**
 * Formats a number or string representation of a number to a specified number of decimal places.
 *
 * - If `dynamicDecimal` is true, it adjusts decimal places dynamically for very small numbers.
 * - If `commify` is true, it adds commas to the integer part.
 * - Negative numbers are converted to positive before formatting.
 *
 * @param {number | string} _number - The number to format.
 * @param {number} [decimalDigit=FLOATING_POINT_DIGIT] - The number of decimal places to keep.
 * @param {boolean} [commify] - Whether to add commas to the integer part.
 * @param {boolean} [dynamicDecimal] - Whether to dynamically adjust decimal places for small numbers.
 * @returns {string} The formatted number as a string.
 *
 * @example
 * formatDecimal(1234.56789, 2); // "1234.56"
 * formatDecimal("0.0000001123", 6, false, true); // "0.0000001"
 * formatDecimal(-4567.89123, 3, true); // "4,567.891"
 * formatDecimal(1000, 2, true); // "1,000"
 */
export function formatDecimal(_number: number | string, decimalDigit = FLOATING_POINT_DIGIT, commify?: boolean, dynamicDecimal?: boolean): string {
  const MAX_DECIMAL_POINTS = 6;

  // make number positive if it is negative
  const sNumber = Number(_number) < 0 ? String(-Number(_number)) : String(_number);

  const dotIndex = sNumber.indexOf('.');

  if (dotIndex < 0) {
    return sNumber;
  }

  let integerDigits = sNumber.slice(0, dotIndex);

  if (integerDigits === '0' && dynamicDecimal) {
    // Adjust decimal places for very small numbers
    // to show very small numbers such as 0.0000001123
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
export function sciToDecimal(value: string | number) {
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

/**
 * Converts a raw amount to a human-readable format by adjusting for decimals.
 *
 * - Removes any commas from the input amount.
 * - Divides the amount by 10 raised to the power of `_decimals` to get the human-readable value.
 * - Uses `formatDecimal` to apply decimal precision and optional comma formatting.
 *
 * @param {string | number | BN | bigint | Compact<u128> | undefined} _amount - The raw amount to convert.
 * @param {number | undefined} _decimals - The number of decimal places the raw amount is based on.
 * @param {number} [decimalDigits] - The number of decimal places to display in the formatted output.
 * @param {boolean} [commify] - Whether to add commas for readability.
 * @returns {string} The formatted human-readable amount.
 *
 * @example
 * amountToHuman(100000000, 6) // "100"
 * amountToHuman("2500000000", 8, 2) // "25.00"
 * amountToHuman(123456789, 6, 4, true) // "123.4567"
 * amountToHuman("5000000", 3, 0, true) // "5,000"
 */
export function amountToHuman(_amount: string | number | BN | bigint | Compact<u128> | undefined, _decimals: number | undefined, decimalDigits?: number, commify?: boolean): string {
  if (!_amount || !_decimals) {
    return '';
  }

  _amount = String(_amount).replace(/,/g, '');

  const x = 10 ** _decimals;
  const rawValue = Number(_amount) / x;

  // convert scientific notation to decimal string before formatting
  const normalized = sciToDecimal(rawValue);

  return formatDecimal(normalized, decimalDigits, commify);
}

/**
 * Converts a human-readable amount to its machine-readable format by accounting for decimals.
 *
 * - Removes the decimal point and shifts the decimal place as needed.
 * - The amount is then multiplied by 10^decimal to scale it up to the machine's internal format.
 *
 * @param {string | undefined} amount - The human-readable amount to convert (e.g., "100.25").
 * @param {number | undefined} decimal - The number of decimals to scale the amount by.
 * @returns {BN} The machine-readable value as a BN (BigNumber) object.
 *
 * @throws {Error} If the `decimal` is smaller than the number of decimal digits in the amount.
 *
 * @example
 * amountToMachine("100.25", 2) // BN instance representing 10025
 * amountToMachine("25.001", 4) // BN instance representing 250010
 * amountToMachine("500", 2) // BN instance representing 50000
 * amountToMachine("0.005", 6) // BN instance representing 5000
 */
export function amountToMachine(amount: string | undefined, decimal: number | undefined): BN {
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
