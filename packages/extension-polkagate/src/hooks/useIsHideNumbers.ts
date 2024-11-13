// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';

export default function useIsHideNumbers (): boolean | undefined {
  const [hideNumbers, setHideNumbers] = useState<boolean>();

  useEffect(() => {
    getStorage('hide_numbers').then((isHide) => {
      setHideNumbers(!!isHide);
    }).catch(console.error);

    const unsubscribe = watchStorage('hide_numbers', setHideNumbers);

    return () => {
      unsubscribe();
    };
  }, []);

  return hideNumbers;
}
