// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { hexToString, hexToU8a, isHex, stringToU8a, u8aToHex, u8aToString } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import allChains from './chains';
import { SHORT_ADDRESS_CHARACTERS, WESTEND_GENESIS_HASH } from './constants';

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

export function toShortAddress (address?: string | AccountId, count = SHORT_ADDRESS_CHARACTERS): string {
  if (!address) {
    return '';
  }

  address = String(address);

  return `${address.slice(0, count)}...${address.slice(-1 * count)}`;
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
