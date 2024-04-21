// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { PalletIdentityRegistration } from '@polkadot/types/lookup';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { hexToString } from '@polkadot/util';

interface SubIdentity {
  parentAddress: string,
  display: string
}

export default function useAccountInfo2 (api: ApiPromise | undefined, formatted: string | undefined, accountInfo?: DeriveAccountInfo): DeriveAccountInfo | undefined {
  const [info, setInfo] = useState<DeriveAccountInfo | undefined>();

  const getIdentityOf = useCallback(async (accountId: string) => {
    if (!api?.query?.identity?.identityOf || !accountId) {
      return;
    }

    const i = await api.query.identity.identityOf(accountId);
    const id = i.isSome ? i.unwrap()[0] as PalletIdentityRegistration : undefined;

    return id?.info
      ? {
        display: hexToString(id.info.display.asRaw.toHex()),
        email: hexToString(id.info.email.asRaw.toHex()),
        judgements: id.judgements,
        legal: hexToString(id.info.legal.asRaw.toHex()),
        riot: hexToString(id.info.riot.asRaw.toHex()),
        twitter: hexToString(id.info.twitter.asRaw.toHex()),
        web: hexToString(id.info.web.asRaw.toHex())
      }
      : undefined;
  }, [api]);

  const getSubIdentityOf = useCallback(async (): Promise<SubIdentity | undefined> => {
    if (!api || !formatted) {
      return;
    }

    const s = await api.query.identity.superOf(formatted);
    const subId = s.isSome ? s.unwrap() : undefined;

    return subId
      ? {
        display: hexToString(subId[1].asRaw.toHex()),
        parentAddress: subId[0].toString() as string
      }
      : undefined;
  }, [api, formatted]);

  useEffect(() => {
    if (accountInfo && accountInfo.accountId?.toString() === formatted) {
      return setInfo(accountInfo);
    }

    api && formatted && getIdentityOf(formatted).then((identity) => {
      if (identity) {
         setInfo({
          accountId: api.createType('AccountId', formatted),
          identity
        });
      } else {
        // check if it has subId
        getSubIdentityOf().then((subId) => {
          if (subId) {
            getIdentityOf(subId.parentAddress).then((parentIdentity) => {
              if (parentIdentity) {
                const subIdentity = {
                  accountId: api.createType('AccountId', formatted),
                  identity: {
                    ...parentIdentity,
                    display: subId.display,
                    displayParent: parentIdentity.display
                  }
                };

                return setInfo(subIdentity);
              }
            }).catch(console.error);
          }
        }).catch(console.error);
      }
    }).catch(console.error);

    api && formatted && api.derive.accounts.info(formatted).then((i) => {
      i && setInfo(i);
    }).catch(console.error);
  }, [accountInfo, api, formatted, getIdentityOf, getSubIdentityOf]);

  return info;
}
