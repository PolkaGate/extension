// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { getStorage, setStorage, watchStorage } from '../components/Loading';

interface HideNumbersProps {
  isHideNumbers: boolean | undefined;
  toggleHideNumbers: () => void;
}

const HIDE_NUMBERS = 'hide_numbers';

export default function useIsHideNumbers(): HideNumbersProps {
  const [hideNumbers, setHideNumbers] = useState<boolean>();

  const toggleHideNumbers = useCallback(() => {
    setStorage(HIDE_NUMBERS, !hideNumbers).catch(console.error);
  }, [hideNumbers]);

  useEffect(() => {
    getStorage(HIDE_NUMBERS).then((isHide) => {
      setHideNumbers(!!isHide);
    }).catch(console.error);

    const unsubscribe = watchStorage(HIDE_NUMBERS, setHideNumbers);

    return () => {
      unsubscribe();
    };
  }, []);

  return { isHideNumbers: hideNumbers, toggleHideNumbers };
}
