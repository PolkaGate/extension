// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN } from '@polkadot/util';

import { AccountContext } from '../components/contexts';
import { getFormattedAddress } from '../util/utils';

export type ActiveRecoveryFor = {
  rescuer: string;
  lost: string;
  createdBlock: number;
  deposit: BN;
  vouchedFriends: string[];
}

export default function useActiveRecoveries(api: ApiPromise | undefined, rescuer?: string): ActiveRecoveryFor | ActiveRecoveryFor[] | null | undefined {
  const { accounts } = useContext(AccountContext);

  const [activeRecoveryFor, setActiveRecoveryFor] = useState<ActiveRecoveryFor | null>();
  const [activeRecoveriesInExtension, setActiveRecoveryExtension] = useState<ActiveRecoveryFor[]>([]);

  useEffect(() => {
    api && api.query.recovery.activeRecoveries.entries().then((actives) => {
      const myActiveRecovery: ActiveRecoveryFor[] = [];

      actives.forEach((activeRecovery) => {
        const lostAddress = activeRecovery[0].args[0].toString();
        const rescuerAddress = activeRecovery[0].args[1].toString();
        const activeRecoveryInfo = activeRecovery[1].unwrap() as { created: BN, deposit: BN, friends: BN };
        const createdBlockBN = activeRecoveryInfo.created;
        const depositedValue = activeRecoveryInfo.deposit;

        if (rescuer) {
          rescuerAddress === rescuer &&
            myActiveRecovery.push({
              createdBlock: createdBlockBN.toNumber(),
              deposit: depositedValue,
              lost: lostAddress,
              rescuer: rescuerAddress,
              vouchedFriends: activeRecoveryInfo.friends.toHuman() as string[]
            });
        } else {
          accounts.forEach((account) => {
            const formatted = getFormattedAddress(account.address, undefined, api.registry.chainSS58 ?? 42);

            if ([lostAddress, rescuerAddress].includes(formatted)) {
              setActiveRecoveryExtension((pervActives) => [...pervActives, {
                createdBlock: createdBlockBN.toNumber(),
                deposit: depositedValue,
                lost: lostAddress,
                rescuer: rescuerAddress,
                vouchedFriends: activeRecoveryInfo.friends.toHuman() as string[]
              }]);
            }
          });
        }
      });

      rescuer && myActiveRecovery.length > 0
        ? setActiveRecoveryFor(myActiveRecovery[myActiveRecovery.length - 1])
        : setActiveRecoveryFor(null);
    }).catch(console.error);
  }, [accounts, api, rescuer]);

  return rescuer
    ? activeRecoveryFor
    : activeRecoveriesInExtension;
}
