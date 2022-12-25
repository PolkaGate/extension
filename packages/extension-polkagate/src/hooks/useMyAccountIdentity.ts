// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { updateMeta } from '../messaging';
import { SavedIdentities } from '../util/types';
import useFormatted from './useFormatted';
import { useAccount, useApi, useChainName } from '.';

/** This hook is going to be used for users account existing in the extension */
export default function useMyAccountIdentity(address: AccountId | string | undefined): DeriveAccountRegistration | null | undefined {
  const formatted = useFormatted(address);
  const api = useApi(address);
  const account = useAccount(address);
  const chainName = useChainName(formatted);

  const [info, setInfo] = useState<DeriveAccountInfo | null | undefined>();
  const [oldIdentity, setOldIdentity] = useState<DeriveAccountRegistration | null | undefined>();

  useEffect(() => {
    api && formatted && api.derive.accounts.info(formatted).then((info) => {
      info?.identity?.display
        ? setInfo(JSON.parse(JSON.stringify(info)) as DeriveAccountInfo)
        : setInfo(null);
    }).catch(console.error);
  }, [api, formatted]);

  useEffect(() => {
    if (!account || !chainName || !info || !address || info.accountId !== formatted) {
      return;
    }

    const savedIdentities = JSON.parse(account?.identities ?? '{}') as SavedIdentities;

    savedIdentities[chainName] = info.identity;
    const metaData = JSON.stringify({ identities: JSON.stringify(savedIdentities) });

    updateMeta(address, metaData).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, address, chainName, info, formatted]);

  useEffect(() => {
    if (!account || !chainName) {
      return;
    }

    const savedIdentities = JSON.parse(account?.identities ?? '{}') as SavedIdentities;

    if (savedIdentities[chainName]) {
      setOldIdentity(savedIdentities[chainName]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, chainName]);

  return info?.identity || oldIdentity;
}
