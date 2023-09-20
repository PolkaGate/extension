// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { AccountContext } from '../components/contexts';

export type ActiveRecoveryFor = {
  rescuer: string;
  lost: string;
  createdBlock: number;
  deposit: BN;
  vouchedFriends: string[];
}

export default function useActiveRecoveries(api: ApiPromise | undefined, searchFor?: string): ActiveRecoveryFor[] | null | undefined {
  const { accounts } = useContext(AccountContext);

  const [activeRecoveries, setActiveRecoveries] = useState<ActiveRecoveryFor[] | null>();
  const [fetching, setFetching] = useState<boolean | null>(false);

  useEffect(() => {
    if (!api) {
      setActiveRecoveries(undefined);
      setFetching(false);

      return;
    }

    if (fetching !== false) {
      return;
    }

    setFetching(true);

    api.query.recovery.activeRecoveries.entries().then((actives) => {
      const myActiveRecovery: ActiveRecoveryFor[] = [];

      if (actives.length === 0) {
        setActiveRecoveries(null);

        return;
      }

      actives.forEach((activeRecovery) => {
        const lostAddress = activeRecovery[0].args[0].toString();
        const rescuerAddress = activeRecovery[0].args[1].toString();
        const activeRecoveryInfo = activeRecovery[1].unwrap() as { created: BN, deposit: BN, friends: BN };
        const createdBlockBN = activeRecoveryInfo.created;
        const depositedValue = activeRecoveryInfo.deposit;

        const gathered = {
          createdBlock: createdBlockBN.toNumber(),
          deposit: depositedValue,
          lost: lostAddress,
          rescuer: rescuerAddress,
          vouchedFriends: activeRecoveryInfo.friends.toHuman() as string[]
        };

        if (searchFor) {
          (searchFor === rescuerAddress || searchFor === lostAddress) &&
            myActiveRecovery.push(gathered);
        } else {
          setActiveRecoveries((pervActives) => [...(pervActives ?? []), gathered]);
        }
      });

      searchFor && myActiveRecovery.length > 0 && setActiveRecoveries(myActiveRecovery);
      setFetching(null);
    }).catch(console.error);
  }, [accounts, api, fetching, searchFor]);

  return activeRecoveries;
}
