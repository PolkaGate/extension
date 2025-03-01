// Copyright 2017-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { PalletNominationPoolsPoolMember } from '@polkadot/types/lookup';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import type { MembersMapEntry } from '../util/types';

interface Member {
  accountId: string;
  member: PalletNominationPoolsPoolMember;
}

export function usePoolMembers(api: ApiPromise | undefined, poolId: string | undefined): MembersMapEntry[] | undefined {
  const [poolMembers, setPoolMembers] = useState<Member[]>();
  const [isFetching, setFetching] = useState<boolean>(false);

  const fetchMembers = useCallback(() => {
    if (!api || poolId === undefined) {
      return;
    }

    setFetching(true);

    api.query?.nominationPools && api.query['nominationPools']['poolMembers'].entries().then((entries) => {
      const members = entries.reduce((all, [{ args: [accountId] }, optMember]) => {
        if (optMember.isSome) {
          const member = optMember.unwrap();
          const poolId = member.poolId.toString();

          if (!all[poolId]) {
            all[poolId] = [];
          }

          all[poolId].push({ accountId: accountId.toString(), member });
        }

        return all;
      }, {});

      console.log('members[poolId]', members[poolId]);
      const output = members[poolId] as Member[];

      output?.length >= 2 && output.sort((a, b) => b.member.points.sub(a.member.points).gtn(0) ? 1 : -1);

      setPoolMembers(output);
      setFetching(false);
    });
  }, [api, poolId]);

  useEffect(() => {
    if (!api || poolId === undefined || poolMembers) {
      return;
    }

    if (isFetching) {
      return console.log('Fetch pool members is already fetching!');
    }

    fetchMembers();
  }, [api, fetchMembers, isFetching, poolId, poolMembers]);

  return poolMembers;
}
