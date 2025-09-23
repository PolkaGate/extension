// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { SelectedType } from '@polkadot/extension-polkagate/src/util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext, SelectedContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getAndWatchStorage, getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';
import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, PROFILE_TAGS, SELECTED_ACCOUNT_IN_STORAGE, SELECTED_PROFILE_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

interface Props {
  children: React.ReactNode;
}

const DEFAULT_SELECTED = {
  account: undefined,
  chains: undefined,
  profile: PROFILE_TAGS.ALL
};

export default function SelectedProvider ({ children }: Props) {
  const { accounts } = useContext(AccountContext);

  const [selected, setSelected] = useState<SelectedType>(DEFAULT_SELECTED);

  const setSelectedAccount = useCallback((item: AccountJson) => {
    setSelected((prev) => ({ ...prev, account: item }));
  }, []);

  const setSelectedProfile = useCallback((item: string | undefined) => {
    setSelected((prev) => ({ ...prev, profile: item ?? PROFILE_TAGS.ALL }));
  }, []);

  type ChainMap = Record<string, string>;
  const setSelectedChain = useCallback((res: string | ChainMap) => {
    let parsedRes: ChainMap | undefined;

    if (typeof res === 'object' && res !== null) {
      parsedRes = res;
    } else if (typeof res === 'string') {
      try {
        parsedRes = JSON.parse(res) as ChainMap;
      } catch {
        parsedRes = undefined;
      }
    }

    setSelected((prev) => ({ ...prev, chains: parsedRes }));
  }, []);

  const handleSetAccount = useCallback((address: string | object) => {
    let found;

    if (address) {
      const savedAddress = getSubstrateAddress(address as string);

      found = accounts.find(({ address }) => address === savedAddress);
    }

    setSelectedAccount(found ?? accounts?.[0] ?? null);
  }, [accounts, setSelectedAccount]);

  useEffect(() => {
    return getAndWatchStorage(
      SELECTED_ACCOUNT_IN_STORAGE,
      handleSetAccount
    );
  }, [handleSetAccount]);

  useEffect(() => {
    return getAndWatchStorage(
      SELECTED_PROFILE_NAME_IN_STORAGE,
      setSelectedProfile
    );
  }, [setSelectedProfile]);

  useEffect(() => {
    return getAndWatchStorage(
      ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE,
      setSelectedChain
    );
  }, [setSelectedChain]);

  const contextValue = useMemo(() => ({ selected, setSelected }), [selected]);

  return (
    <SelectedContext.Provider value={contextValue}>
      {children}
    </SelectedContext.Provider>
  );
}
