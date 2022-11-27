// Copyright 2017-2022 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { useState, useEffect } from 'react';

import { MembersMapEntry } from '../util/types';

export function usePoolMembers(api: ApiPromise, poolID: string): MembersMapEntry[] | undefined {
  const [poolMembers, setPoolMembers] = useState();

  useEffect(() => {
    if (!api) {
      return;
    }

    // eslint-disable-next-line no-void
    void api.query.nominationPools.poolMembers.entries().then((entries) => {
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

      setPoolMembers(members[poolID]);
    });
  }, [api?.query.nominationPools.poolMembers, poolID]);

  return poolMembers;
}
