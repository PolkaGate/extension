// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext } from '../components';
import { accountsValidate } from '../messaging';

export default function useIsPasswordCorrect (password: string | undefined, ready?: boolean) {
  const { accounts } = useContext(AccountContext);

  const [isCorrect, setCorrect] = useState<boolean>();

  const localAccounts = useMemo(
    () => accounts.filter(({ isExternal }) => !isExternal),
    [accounts]
  );

  const firstLocal = localAccounts[0];
  const hasNoLocalAccounts = localAccounts.length === 0;

  useEffect(() => {
    setCorrect(undefined);

    if (!password || ready === false || !firstLocal) {
      return;
    }

    accountsValidate(localAccounts[0].address, password).then((status) => {
      setCorrect(status);
    }).catch((error) => {
      console.error(error);
      setCorrect(false);
    });
  }, [firstLocal, localAccounts, password, ready]);

  return {
    hasNoLocalAccounts,
    isPasswordCorrect: hasNoLocalAccounts ? true : isCorrect
  };
}
