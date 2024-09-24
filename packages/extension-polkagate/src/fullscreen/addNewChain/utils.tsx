// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { DropdownOption } from '../../util/types';
import type { UserAddedEndpoint } from './types';

import { useEffect, useMemo, useState } from 'react';

import { getStorage } from '../../components/Loading';

export function useUserAddedEndpoints (): Record<HexString, UserAddedEndpoint> | undefined {
  const [userEndpoints, setEndpoints] = useState<Record<HexString, UserAddedEndpoint>>();

  useEffect(() => {
    getStorage('userAddedEndpoint').then((info) => {
      if (!info) {
        return;
      }

      setEndpoints(info as Record<HexString, UserAddedEndpoint>);
    }).catch(console.error);
  }, []);

  return userEndpoints;
}

export function UseUserAddedEndpoint (genesis: string | null | undefined): DropdownOption []| undefined {
  const endpoints = useUserAddedEndpoints();

  return useMemo(() => {
    if (!endpoints) {
      return;
    }

    const maybeEndpoint = Object.entries(endpoints).find(([genesisHash]) => genesis === genesisHash);

    return maybeEndpoint ? [{ text: 'endpoint', value: maybeEndpoint[1].endpoint }] : undefined;
  }, [endpoints, genesis]);
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function UseUserAddedChainColor (_genesisHash: HexString | string | undefined): string | undefined {
  const endpoints = useUserAddedEndpoints();

  return useMemo(() => {
    if (!endpoints) {
      return;
    }

    return Object.entries(endpoints).find(([genesisHash]) => _genesisHash === genesisHash)?.[1].color;
  }, [_genesisHash, endpoints]);
}
