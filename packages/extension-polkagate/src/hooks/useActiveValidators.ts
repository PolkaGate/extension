// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { ValidatorInfo } from '../util/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DeriveStakingQuery } from '@polkadot/api-derive/types';
import { BN, hexToBn, isHex } from '@polkadot/util';

import { useStakingAccount, useStakingConsts, useValidators, useValidatorsIdentities } from '.';

export interface MyValidatorsInfo {
  activeValidators: ValidatorInfo[] | undefined | null;
  nonActiveValidators: ValidatorInfo[] | undefined | null;
}

export default function useActiveValidators(address: string): MyValidatorsInfo {
  const allValidatorsInfo = useValidators(address);
  const stakingConsts = useStakingConsts(address);
  const allValidatorsAccountIds = useMemo(() => allValidatorsInfo && allValidatorsInfo.current.concat(allValidatorsInfo.waiting)?.map((v) => v.accountId), [allValidatorsInfo]);
  const allValidatorsIdentities = useValidatorsIdentities(address, allValidatorsAccountIds);

  const stakingAccount = useStakingAccount(address);

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active, [stakingAccount?.stakingLedger?.active]);

  const [nominatedValidatorsIds, setNominatedValidatorsIds] = useState<string[] | undefined | null>();

  useEffect(() => {
    setNominatedValidatorsIds(stakingAccount === null || stakingAccount?.nominators?.length === 0 ? null : stakingAccount?.nominators.map((item) => item.toString()));
  }, [stakingAccount]);

  const nominatedValidatorsInfo = useMemo(() =>
    allValidatorsInfo && nominatedValidatorsIds && allValidatorsInfo.current
      .concat(allValidatorsInfo.waiting)
      .filter((v: DeriveStakingQuery) => nominatedValidatorsIds.includes(v.accountId))
    , [allValidatorsInfo, nominatedValidatorsIds]);

  const overSubscribed = useCallback((v: ValidatorInfo): { notSafe: boolean, safe: boolean } | undefined => {
    if (!stakingConsts) {
      return;
    }

    const threshold = stakingConsts.maxNominatorRewardedPerValidator;
    const sortedNominators = v.exposure.others.sort((a, b) => b.value - a.value);
    const maybeMyIndex = staked ? sortedNominators.findIndex((n) => new BN(isHex(n.value) ? hexToBn(n.value) : String(n.value)).lt(staked)) : -1;

    return {
      notSafe: v.exposure.others.length > threshold && (maybeMyIndex > threshold || maybeMyIndex === -1),
      safe: v.exposure.others.length > threshold && (maybeMyIndex < threshold || maybeMyIndex === -1)
    };
  }, [staked, stakingConsts]);

  const activeValidatorsWithoutIdentity = useMemo(
    () =>
      nominatedValidatorsInfo?.filter(
        (sv) => sv?.exposure?.others?.find(
          ({ who }) => who?.toString() === stakingAccount?.accountId?.toString()))
    , [nominatedValidatorsInfo, stakingAccount?.accountId]);

  const activeValidators = useMemo(
    () => {
      if (nominatedValidatorsIds === null) {
        return null;
      }

      return activeValidatorsWithoutIdentity?.map(
        (av) => {
          av.accountInfo = allValidatorsIdentities?.find((a) => a.accountId === av.accountId);
          av.isOversubscribed = overSubscribed(av);

          return av;
        });
    }
    , [activeValidatorsWithoutIdentity, allValidatorsIdentities, nominatedValidatorsIds, overSubscribed]);

  const nonActiveValidators = useMemo(
    () => {
      if (nominatedValidatorsIds === null) {
        return null;
      }

      return nominatedValidatorsInfo?.filter((nv) =>
        activeValidators?.find((av) => av.accountId !== nv.accountId)
      ).map(
        (n) => {
          n.accountInfo = allValidatorsIdentities?.find((a) => a.accountId === n.accountId);
          n.isOversubscribed = overSubscribed(n);

          return n;
        });
    }
    , [activeValidators, allValidatorsIdentities, nominatedValidatorsIds, nominatedValidatorsInfo, overSubscribed]);

  return { activeValidators, nonActiveValidators };
}
