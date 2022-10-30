// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

export default function getFormatted(address: string, format: number): string | undefined {
  const publicKey = decodeAddress(address);
  const formatted = encodeAddress(publicKey, format);

  return formatted;
}
