// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import useIsExtensionPopup from './useIsExtensionPopup';

const MAX_WAITING_TIME = 1500; // ms

export default function useIsFlying (): boolean {
  const isExtension = useIsExtensionPopup();

  const [isFlying, setIsFlying] = useState(true);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsFlying(false);
    }, MAX_WAITING_TIME);

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []);

  useEffect(() => {
    !isExtension && setIsFlying(false);
  }, [isExtension]);

  return isFlying;
}
