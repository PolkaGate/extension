// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletRecoveryRecoveryConfig, PalletReferendaReferendumInfoRankedCollectiveTally, PalletReferendaReferendumStatusRankedCollectiveTally } from '@polkadot/types/lookup';

import { useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { Proxy } from '../,,/../util/types';
import { PROXY_CHAINS } from '../util/constants';
import useActiveRecoveries from './useActiveRecoveries';
import { useInfo } from '.';

type Item = 'identity' | 'proxy' | 'bounty' | 'recovery' | 'referenda';
export type Reserved = { [key in Item]?: BN };

export default function useReservedDetails (address: string | undefined): Reserved {
  const { api, formatted, genesisHash } = useInfo(address);
  const activeRecoveries = useActiveRecoveries(api);
  const [reserved, setReserved] = useState<Reserved>({});

  const activeLost = useMemo(() =>
    activeRecoveries && formatted
      ? activeRecoveries.filter((active) => active.lost === String(formatted)).at(-1) ?? null
      : activeRecoveries === null
        ? null
        : undefined
  , [activeRecoveries, formatted]);

  useEffect(() => {
    if (!api || !genesisHash) {
      return;
    }

    // TODO: needs to incorporate people chain
    /** fetch identity reserved */
    api.query?.identity?.identityOf(formatted).then((id) => {
      const basicDeposit = api.consts.identity.basicDeposit;

      !id.isEmpty && setReserved((prev) => {
        prev.identity = basicDeposit as unknown as BN;

        return prev;
      });
    }).catch(console.error);

    /** fetch proxy reserved */
    if (api.query?.proxy && PROXY_CHAINS.includes(genesisHash)) {
      const proxyDepositBase = api.consts.proxy.proxyDepositBase as unknown as BN;
      const proxyDepositFactor = api.consts.proxy.proxyDepositFactor as unknown as BN;

      api.query.proxy.proxies(formatted).then((p) => {
        const fetchedProxies = JSON.parse(JSON.stringify(p[0])) as unknown as Proxy[];
        const proxyCount = fetchedProxies.length;

        if (proxyCount > 0) {
          setReserved((prev) => {
            prev.proxy = proxyDepositBase.add(proxyDepositFactor.muln(proxyCount));

            return prev;
          });
        }
      }).catch(console.error);
    }

    /** fetch social recovery reserved */
    api?.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => {
      const recoveryInfo = r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null;

      recoveryInfo?.deposit && setReserved((prev) => {
        prev.recovery = (recoveryInfo.deposit as unknown as BN).add(activeLost?.deposit as unknown as BN || BN_ZERO);

        return prev;
      });
    }).catch(console.error);

    /** Fetch referenda reserved */
    if (api.query?.referenda?.referendumInfoFor) {
      let referendaDepositSum = BN_ZERO;

      api.query.referenda.referendumInfoFor.entries().then((referenda) => {
        referenda.forEach(([_, value]) => {
          if (value.isSome) {
            const ref = (value.unwrap()) as PalletReferendaReferendumInfoRankedCollectiveTally | undefined;

            if (!ref) {
              return;
            }

            const info = (ref.isCancelled
              ? ref.asCancelled
              : ref.isRejected
                ? ref.asRejected
                : ref.isOngoing
                  ? ref.asOngoing
                  : ref.isApproved ? ref.asApproved : undefined) as PalletReferendaReferendumStatusRankedCollectiveTally | undefined;

            if (info?.submissionDeposit && info.submissionDeposit.who.toString() === formatted) {
              referendaDepositSum = referendaDepositSum.add(info.submissionDeposit.amount);
            }

            if (info?.decisionDeposit?.isSome) {
              const decisionDeposit = info?.decisionDeposit.unwrap();

              if (decisionDeposit.who.toString() === formatted) {
                referendaDepositSum = referendaDepositSum.add(decisionDeposit.amount);
              }
            }
          }
        });

        if (!referendaDepositSum.isZero()) {
          setReserved((prev) => {
            prev.referenda = referendaDepositSum;

            return prev;
          });
        }
      }).catch(console.error);
    }

    /** Fetch bounties reserved */
    if (api.query?.bounties?.bounties) {
      let bountiesDepositSum = BN_ZERO;

      api.query.bounties.bounties.entries().then((bounties) => {
        bounties.forEach(([_, value]) => {
          if (value.isSome) {
            const bounty = (value.unwrap());

            if (bounty.proposer.toString() === formatted) {
              bountiesDepositSum = bountiesDepositSum.add(bounty.curatorDeposit);
            }
          }
        });

        if (!bountiesDepositSum.isZero()) {
          setReserved((prev) => {
            prev.bounty = bountiesDepositSum;

            return prev;
          });
        }
      }).catch(console.error);
    }
  }, [activeLost?.deposit, api, formatted, genesisHash]);

  useEffect(() => {
    setReserved({});
  }, [activeLost?.deposit, api, formatted, genesisHash]);

  return reserved;
}
