// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Proxy, TxResult } from '../types';

import { useCallback, useMemo, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { useChainInfo, useEstimatedFee2, useFormatted3, usePoolStakingInfo, useSoloStakingInfo, useTranslation } from '../../hooks';
import { DATE_OPTIONS } from '../constants';
import { amountToHuman, amountToMachine } from '../utils';
import { signAndSend } from './';

export async function createPool (
  api: ApiPromise,
  depositor: string | null,
  signer: KeyringPair,
  value: BN,
  poolId: number,
  roles: {
    root?: string;
    nominator?: string;
    bouncer?: string;
  },
  poolName: string,
  proxy?: Proxy
): Promise<TxResult> {
  try {
    if (!depositor) {
      console.log('createPool:  _depositor is empty!');

      return { success: false };
    }

    const created = api.tx['utility']['batch']([
      api.tx['nominationPools']['create'](value, roles.root, roles.nominator, roles.bouncer),
      api.tx['nominationPools']['setMetadata'](poolId, poolName)
    ]);

    const tx = proxy ? api.tx['proxy']['proxy'](depositor, proxy.proxyType, created) : created;

    return signAndSend(api, tx, signer, depositor);
  } catch (error) {
    console.log('Something went wrong while createPool', error);

    return { success: false };
  }
}

export const useUnstakingPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const unbonded = api?.tx['nominationPools']['unbond'];
  const poolWithdrawUnbonded = api?.tx['nominationPools']['poolWithdrawUnbonded'];
  const batchAll = api?.tx['utility']['batchAll'];

  const [unstakingValue, setUnstakingValue] = useState<BN | null | undefined>();

  const unlockingLen = stakingInfo.pool?.stashIdAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api?.consts['staking']['maxUnlockingChunks'];

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : new BN(stakingInfo.pool?.member?.points ?? 0), [stakingInfo.pool]);
  const isPoolOwner = useMemo(() =>
    String(formatted) === String(stakingInfo.pool?.bondedPool?.roles?.root) ||
    String(formatted) === String(stakingInfo.pool?.bondedPool?.roles?.depositor)
  , [formatted, stakingInfo.pool?.bondedPool?.roles?.depositor, stakingInfo.pool?.bondedPool?.roles?.root]);
  const poolState = useMemo(() => String(stakingInfo.pool?.bondedPool?.state), [stakingInfo.pool?.bondedPool?.state]);
  const poolMemberCounter = useMemo(() => Number(stakingInfo.pool?.bondedPool?.memberCounter), [stakingInfo.pool?.bondedPool?.memberCounter]);

  const redeemDate = useMemo(() => {
    if (stakingInfo.stakingConsts) {
      const date = Date.now() + stakingInfo.stakingConsts?.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingInfo.stakingConsts]);

  const tx = useMemo(() => {
    if (unlockingLen === undefined || maxUnlockingChunks === undefined || !poolWithdrawUnbonded || !batchAll || !unbonded || !formatted || !unstakingValue) {
      return undefined;
    }

    const txs = [];

    if (unlockingLen >= Number(maxUnlockingChunks.toString())) {
      const dummyParams = [100];

      txs.push(poolWithdrawUnbonded(...dummyParams));
    }

    txs.push(unbonded(formatted, unstakingValue));

    return txs.length > 1 ? batchAll(txs) : txs[0];
  }, [batchAll, formatted, maxUnlockingChunks, poolWithdrawUnbonded, unbonded, unlockingLen, unstakingValue]);

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? unbonded?.(formatted ?? address ?? '', unstakingValue ?? BN_ONE));

  const transactionInformation = useMemo(() => {
    return [{
      content: unstakingValue,
      description: t('This amount will be redeemable on {{redeemDate}}, and your rewards will be automatically claimed.', { replace: { redeemDate } }),
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: unstakingValue && staked ? (staked as unknown as BN).sub(unstakingValue) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }];
  }, [estimatedFee, redeemDate, staked, t, unstakingValue]);

  const errorMessage = useMemo(() => {
    if (!unstakingValue || !stakingInfo.poolStakingConsts || !staked || !api) {
      return undefined;
    }

    // 1. Check if the user is trying to unstake more than they've staked
    if (unstakingValue.gt(staked ?? BN_ZERO)) {
      return t('It is more than already staked.');
    }

    // 2. If the user is the pool owner:
    // - and the pool is not in "Destroying" state
    // - and more than one member remains
    // - and the remaining stake after unstaking would be less than the minimum allowed to keep owning the pool
    if (isPoolOwner && (poolMemberCounter > 1 || poolState !== 'Destroying') && staked.sub(unstakingValue).lt(stakingInfo.poolStakingConsts.minCreateBond)) {
      const min = amountToHuman(stakingInfo.poolStakingConsts.minCreateBond, decimal ?? 0);

      return t('Remaining stake amount should not be less than {{min}} {{token}}', { replace: { min, token } });
    }

    // 3. If the user is NOT the pool owner:
    // - and they want to keep some stake (not full unstake)
    // - and the remaining stake would be less than the minimum required to stay in the pool
    if (!isPoolOwner && !staked.sub(unstakingValue).isZero() && staked.sub(unstakingValue).lt(stakingInfo.poolStakingConsts.minJoinBond)) {
      const remained = api.createType('Balance', staked.sub(unstakingValue)).toHuman();
      const min = api.createType('Balance', stakingInfo.poolStakingConsts.minJoinBond).toHuman();

      return t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } });
    }

    return undefined;
  }, [api, decimal, isPoolOwner, poolMemberCounter, poolState, staked, stakingInfo.poolStakingConsts, t, token, unstakingValue]);

  const onMaxValue = useMemo(() => {
    if (!stakingInfo.pool || !formatted || !stakingInfo.poolStakingConsts || !staked || staked.isZero()) {
      return '0';
    }

    // Case 1: If user is the pool owner, the pool is being destroyed, and they're the last member
    // The user is able to unstake the full amount
    if (isPoolOwner && poolState === 'Destroying' && poolMemberCounter === 1) {
      return staked.toString();
    }

    // Case 2: If user is the pool owner, but the pool is still active or there are other members
    // They can only unstake down to the minimum required to keep the pool alive
    if (isPoolOwner && (poolState !== 'Destroying' || poolMemberCounter !== 1)) {
      const partial = staked.sub(stakingInfo.poolStakingConsts.minCreateBond);

      // If there's nothing above the minimum, return '0'
      return partial.lten(0) ? '0' : partial.toString();
    }

    // Case 3: If user is NOT the pool owner, the user is able to unstake the full amount
    return staked.toString();
  }, [formatted, isPoolOwner, poolMemberCounter, poolState, staked, stakingInfo.pool, stakingInfo.poolStakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setUnstakingValue(valueAsBN);
  }, [decimal]);

  return {
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setUnstakingValue,
    staked,
    transactionInformation,
    tx,
    unstakingValue
  };
};

export const useUnstakingSolo = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const unbonded = api?.tx['staking']['unbond'];
  const redeem = api?.tx['staking']['withdrawUnbonded'];
  const chill = api?.tx['staking']['chill'];
  const batchAll = api?.tx['utility']['batchAll'];

  const [unstakingValue, setUnstakingValue] = useState<BN | null | undefined>();

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active as unknown as BN | undefined, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const isStopStaking = useMemo(() => Boolean(unstakingValue && staked && unstakingValue.eq(staked)), [staked, unstakingValue]);

  const unlockingLen = stakingInfo.stakingAccount?.stakingLedger?.unlocking?.length;

  const maxUnlockingChunks = api?.consts['staking']['maxUnlockingChunks'];

  const tx = useMemo(() => {
    if (unlockingLen === undefined || maxUnlockingChunks === undefined || !chill || !redeem || !batchAll || !unbonded) {
      return undefined;
    }

    const txs = [];

    if (isStopStaking) {
      txs.push(chill());
    }

    if (unlockingLen >= Number(maxUnlockingChunks.toString())) {
      const dummyParams = [100];

      txs.push(redeem(...dummyParams));
    }

    txs.push(unbonded(unstakingValue));

    return txs.length > 1 ? batchAll(txs) : txs[0];
  }, [batchAll, chill, isStopStaking, maxUnlockingChunks, redeem, unbonded, unlockingLen, unstakingValue]);

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? unbonded?.(unstakingValue ?? BN_ONE));

  const errorMessage = useMemo(() => {
    if (!unstakingValue || unstakingValue.isZero() || !staked || !api) {
      return undefined;
    }

    if (unstakingValue.gt(staked)) {
      return t('It is more than already staked.');
    }

    if (stakingInfo.stakingConsts && !staked.sub(unstakingValue).isZero() && !isStopStaking && staked.sub(unstakingValue).lt(stakingInfo.stakingConsts.minNominatorBond)) {
      const remained = api.createType('Balance', staked.sub(unstakingValue)).toHuman();
      const min = api.createType('Balance', stakingInfo.stakingConsts.minNominatorBond).toHuman();

      return t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } });
    }

    return undefined;
  }, [api, isStopStaking, staked, stakingInfo.stakingConsts, t, unstakingValue]);

  const transactionInformation = useMemo(() => {
    return [{
      content: unstakingValue,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: unstakingValue && staked ? (staked).sub(unstakingValue) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }];
  }, [estimatedFee, staked, t, unstakingValue]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setUnstakingValue(valueAsBN);
  }, [decimal]);
  const onMaxValue = useMemo(() => {
    if (!staked || !decimal) {
      return '0';
    }

    return staked.toString();
  }, [decimal, staked]);

  return {
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setUnstakingValue,
    staked,
    transactionInformation,
    tx,
    unstakingValue
  };
};
