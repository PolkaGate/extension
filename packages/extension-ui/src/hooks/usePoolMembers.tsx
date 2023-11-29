// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletNominationPoolsPoolMember } from '@polkadot/types/lookup';

import { useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { MembersMapEntry } from '../util/types';

interface Member {
  accountId: string;
  member: PalletNominationPoolsPoolMember;
}

export function usePoolMembers(api: ApiPromise, poolId: string): MembersMapEntry[] | undefined {
  const [poolMembers, setPoolMembers] = useState<Member[]>();

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query?.nominationPools && api.query.nominationPools.poolMembers.entries().then((entries) => {
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
    });
  }, [api, poolId]);

  return poolMembers;
}
