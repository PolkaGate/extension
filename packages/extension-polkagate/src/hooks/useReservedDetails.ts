// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import type { Option } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { PalletMultisigMultisig, PalletPreimageRequestStatus, PalletRecoveryRecoveryConfig, PalletReferendaReferendumInfoRankedCollectiveTally, PalletReferendaReferendumStatusRankedCollectiveTally, PalletSocietyBid, PalletSocietyCandidacy } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { MIGRATED_NOMINATION_POOLS_CHAINS, PROXY_CHAINS } from '../util/constants';
import useActiveRecoveries from './useActiveRecoveries';
import { useAccountAssets, useInfo } from '.';

type Item = 'identity' | 'proxy' | 'bounty' | 'recovery' | 'referenda' | 'index' | 'society' | 'multisig' | 'preimage' | 'pooledBalance';
export type Reserved = { [key in Item]?: Balance };

export default function useReservedDetails (address: string | undefined): Reserved {
  const { api, formatted, genesisHash } = useInfo(address);
  const activeRecoveries = useActiveRecoveries(api);
  const accountAssets = useAccountAssets(address);

  const [reserved, setReserved] = useState<Reserved>({});

  const maybePooledBalance = useMemo(() =>
    accountAssets?.find((balance) => balance.genesisHash === genesisHash)?.pooledBalance
  , [accountAssets, genesisHash]);

  const activeLost = useMemo(() =>
    activeRecoveries && formatted
      ? activeRecoveries.filter((active) => active.lost === String(formatted)).at(-1) ?? null
      : activeRecoveries === null
        ? null
        : undefined
  , [activeRecoveries, formatted]);

  const toBalance = useCallback((value: BN) => {
    if (!api) {
      return undefined;
    }

    return api.createType('Balance', value);
  }, [api]);

  useEffect(() => {
    if (!api || !genesisHash) {
      return;
    }

    try {
      // TODO: needs to incorporate people chain?
      /** fetch identity  */
      api.query?.['identity']?.['identityOf'](formatted).then(async (id) => {
        const basicDeposit = api.consts['identity']['basicDeposit'] as unknown as BN;
        // const subAccountDeposit = api.consts['identity']['subAccountDeposit'] as unknown as BN;

        const subs = await api.query['identity']['subsOf'](formatted);

        const subAccountsDeposit = (subs ? subs[0] : BN_ZERO) as unknown as BN;

        const sum = (basicDeposit.add(subAccountsDeposit)) as unknown as BN;

        !id.isEmpty && setReserved((prev) => {
          prev.identity = toBalance(sum);

          return prev;
        });
      }).catch(console.error);

      /** fetch proxy  */
      if (api.query?.['proxy'] && PROXY_CHAINS.includes(genesisHash)) {
        api.query['proxy']['proxies'](formatted).then((p) => {
          const maybeDeposit = p?.[1] as BN;

          if (!maybeDeposit?.isZero()) {
            setReserved((prev) => {
              prev.proxy = toBalance(maybeDeposit);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** fetch social recovery  */
      api.query?.['recovery']?.['recoverable'](formatted).then((r) => {
        const recoveryInfo = r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null;

        recoveryInfo?.deposit && setReserved((prev) => {
          prev.recovery = toBalance((recoveryInfo.deposit as unknown as BN).add(activeLost?.deposit as unknown as BN || BN_ZERO));

          return prev;
        });
      }).catch(console.error);

      /** Fetch referenda  */
      if (api.query?.['referenda']?.['referendumInfoFor']) {
        let referendaDepositSum = BN_ZERO;

        api.query['referenda']['referendumInfoFor'].entries().then((referenda) => {
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
              prev.referenda = toBalance(referendaDepositSum);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** Fetch bounties  */
      if (api.query?.['bounties']?.['bounties']) {
        let sum = BN_ZERO;

        api.query['bounties']['bounties'].entries().then((bounties) => {
          bounties.forEach(([_, value]) => {
            if (value.isSome) {
              const bounty = (value.unwrap());

              if (bounty.proposer.toString() === formatted) {
                sum = sum.add(bounty.curatorDeposit);
              }
            }
          });

          if (!sum.isZero()) {
            setReserved((prev) => {
              prev.bounty = toBalance(sum);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** Fetch indices  */
      if (api.query?.['indices']?.['accounts']) {
        let sum = BN_ZERO;

        api.query['indices']['accounts'].entries().then((indices) => {
          indices.forEach(([_, value]) => {
            if (value.isSome) {
              const [address, deposit, _status] = value.unwrap() as [AccountId, BN, boolean];

              if (address.toString() === formatted) {
                sum = sum.add(deposit);
              }
            }
          });

          if (!sum.isZero()) {
            setReserved((prev) => {
              prev.index = toBalance(sum);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** Fetch multisig  */
      if (api.query?.['multisig']) {
        let sum = BN_ZERO;

        api.query['multisig']['multisigs'].entries().then((multisigs) => {
          multisigs.forEach(([_, value]) => {
            if (value.isSome) {
              const { deposit, depositor } = value.unwrap() as PalletMultisigMultisig;

              if (depositor.toString() === formatted) {
                sum = sum.add(deposit);
              }
            }
          });

          if (!sum.isZero()) {
            setReserved((prev) => {
              prev.multisig = toBalance(sum);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** Fetch preImage  */
      if (api.query?.['preimage']?.['requestStatusFor']) {
        let sum = BN_ZERO;

        api.query['preimage']['requestStatusFor'].entries().then((preimages) => {
          preimages.forEach(([_, value]) => {
            if (value.isSome) {
              const status = value.unwrap() as PalletPreimageRequestStatus;

              const request = status.isUnrequested ? status.asUnrequested : undefined;

              if (request) {
                const [accountId, deposit] = request.ticket;

                if (accountId.toString() === formatted) {
                  sum = sum.add(deposit);
                }
              }
            }
          });

          if (!sum.isZero()) {
            setReserved((prev) => {
              prev.preimage = toBalance(sum);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** Fetch society  */
      if (api.query?.['society']) {
        let sum = BN_ZERO;

        api.query['society']['bids']().then(async (bids) => {
          (bids as unknown as PalletSocietyBid[]).forEach(({ kind, who }) => {
            if (who.toString() === formatted) {
              const deposit = kind.isDeposit ? kind.asDeposit : BN_ZERO;

              sum = sum.add(deposit);
            }
          });

          const candidates = await api.query['society']['candidates'](formatted) as Option<PalletSocietyCandidacy>;

          if (candidates.isSome) {
            const { kind } = candidates.unwrap();
            const deposit = kind.isDeposit ? kind.asDeposit : BN_ZERO;

            sum = sum.add(deposit);
          }

          if (!sum.isZero()) {
            setReserved((prev) => {
              prev.society = toBalance(sum);

              return prev;
            });
          }
        }).catch(console.error);
      }

      /** handle pooleBalance as reserved  */
      if (maybePooledBalance && MIGRATED_NOMINATION_POOLS_CHAINS.includes(genesisHash)) {
        if (!maybePooledBalance.isZero()) {
          setReserved((prev) => {
            prev.pooledBalance = toBalance(maybePooledBalance);

            return prev;
          });
        }
      }
    } catch (e) {
      console.error('Fatal error while fetching reserved details:', e);
    }
  }, [activeLost?.deposit, api, formatted, genesisHash, maybePooledBalance, toBalance]);

  useEffect(() => {
    setReserved({});
  }, [genesisHash]);

  return reserved;
}
