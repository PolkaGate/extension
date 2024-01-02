// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RefObject, useCallback, useEffect } from 'react';

export default function useOutsideClick (refs: RefObject<HTMLDivElement>[], callback: () => void): void {
  const handleClick = useCallback((e: MouseEvent): void => {
    refs.every(({ current }) =>
      current &&
      !current.contains(e.target as HTMLInputElement)
    ) && callback();
  }, [callback, refs]);

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return (): void => {
      document.removeEventListener('click', handleClick);
    };
  });
}
