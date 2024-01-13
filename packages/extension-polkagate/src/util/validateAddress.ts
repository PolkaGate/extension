// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

// eslint-disable-next-line header/header
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';

export default function isValidAddress(_address: string | undefined): boolean {
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
