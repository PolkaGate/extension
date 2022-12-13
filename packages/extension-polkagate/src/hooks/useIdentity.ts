// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { updateMeta } from '../messaging';
import { SavedIdentities } from '../util/types';
import useFormatted from './useFormatted';
import { useAccount, useApi, useChainName } from '.';

export default function useIdentity(address: AccountId | string | undefined): DeriveAccountRegistration | null | undefined {
  const formatted = useFormatted(address);
  const api = useApi(address);
  const account = useAccount(address);
  const chainName = useChainName(address);

  const [identity, setIdentity] = useState<DeriveAccountRegistration | null | undefined>();

  useEffect(() => {
    api && formatted && api.derive.accounts.info(formatted).then((info) => {
      info?.identity?.display ? setIdentity(JSON.parse(JSON.stringify(info.identity)) as DeriveAccountRegistration) : setIdentity(null);
    }).catch(console.error);
  }, [api, formatted]);

  useEffect(() => {
    if (!account || !chainName || !identity || !address) {
      return;
    }

    const savedIdentities = JSON.parse(account?.identities ?? '{}') as SavedIdentities;

    savedIdentities[chainName] = identity;
    const metaData = JSON.stringify({ identities: JSON.stringify(savedIdentities) });

    updateMeta(address, metaData).catch(console.error);
  }, [Object.keys(account ?? {})?.length, address, chainName, identity]);

  useEffect(() => {
    if (!account || !chainName) {
      return;
    }

    const savedIdentities = JSON.parse(account?.identities ?? '{}') as SavedIdentities;

    if (savedIdentities[chainName]) {
      setIdentity(savedIdentities[chainName]);
    }
  }, [Object.keys(account ?? {})?.length, chainName]);

  return identity;
}
