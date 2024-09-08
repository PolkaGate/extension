// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function (parentName?: string | null, suri?: string): string {
  return `${parentName || ''}${suri || ''}`;
}
