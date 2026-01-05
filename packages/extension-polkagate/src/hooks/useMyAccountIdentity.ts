// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { SavedIdentities } from '../util/types';

import { useEffect, useState } from 'react';

import { updateMeta } from '../messaging';
import useAccount from './useAccount';
import useChainInfo from './useChainInfo';
import useFormatted from './useFormatted';
import useIdentity from './useIdentity';

/**
 * @description
 * This hook is going to be used for users account existing in the extension,
 * it utilizes the saved identities in the local storage if any, while fetching the online identity
 * */
export default function useMyAccountIdentity (address: AccountId | string | undefined, genesisHash: string | null | undefined): DeriveAccountRegistration | null | undefined {
  const { chainName } = useChainInfo(genesisHash, true);
  const account = useAccount(address);
  const formatted = useFormatted(address, genesisHash);
  const info = useIdentity(genesisHash ?? '', formatted);

  const [oldIdentity, setOldIdentity] = useState<DeriveAccountRegistration | null | undefined>();

  useEffect(() => {
    if (!account || !chainName || info === undefined || !address || (info?.accountId && String(info.accountId) !== formatted)) {
      return;
    }

    const savedIdentities = JSON.parse(account?.identities ?? '{}') as SavedIdentities;

    /** update saved identities for the account in local storage */
    if (info) {
      savedIdentities[chainName] = info.identity;
    } else {
      delete savedIdentities[chainName];
    }

    const metaData = JSON.stringify({ identities: JSON.stringify(savedIdentities) });

    updateMeta(String(address), metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, address, chainName, info, formatted]);

  useEffect(() => {
    if (!account || !chainName) {
      return;
    }

    const savedIdentities = JSON.parse(account?.identities ?? '{}') as SavedIdentities;

    if (savedIdentities[chainName]) {
      setOldIdentity(savedIdentities[chainName]);
    } else {
      setOldIdentity(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, chainName]);

  return info?.identity || oldIdentity;
}
