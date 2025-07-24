// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AUTO_MODE } from '../util/constants';
import useEndpoint2 from './useEndpoint2';

export default function useIsAutoEndpoint (genesisHash: string | undefined): boolean {
  const { endpoint } = useEndpoint2(genesisHash);

  return endpoint === AUTO_MODE.value;
}
