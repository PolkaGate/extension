// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AUTO_MODE } from '../util/constants';
import useEndpoint from './useEndpoint';

export default function useIsAutoEndpoint (genesisHash: string | undefined): boolean {
  const { endpoint } = useEndpoint(genesisHash);

  return endpoint === AUTO_MODE.value;
}
