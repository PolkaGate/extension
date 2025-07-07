// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Content } from '../../partials/Review';
import type { Proxy, TxResult } from '../types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { useAccountAssets, useChainInfo, useEstimatedFee2, useFormatted3, useIsExposed2, usePoolStakingInfo, useSoloStakingInfo, useTranslation } from '../../hooks';
import { getValue } from '../../popup/account/util';
import { Review } from '../../popup/staking/pool-new';
import { DATE_OPTIONS } from '../constants';
import { amountToHuman, amountToMachine, isHexToBn } from '../utils';
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

export const useRestakeSolo = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const rebond = api?.tx['staking']['rebond'];

  const [rebondValue, setRebondValue] = useState<BN | null | undefined>();

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, rebond, [rebondValue]);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const errorMessage = useMemo(() => {
    if (!unlockingAmount || unlockingAmount.isZero() || !rebondValue || rebondValue.isZero() || !api) {
      return undefined;
    }

    if (rebondValue.gt(unlockingAmount)) {
      return t('It is more than unstaking amount.');
    }

    return undefined;
  }, [api, rebondValue, t, unlockingAmount]);
  const transactionInformation = useMemo(() => {
    return [{
      content: rebondValue,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: rebondValue && staked ? (staked as unknown as BN).add(rebondValue) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }
    ];
  }, [estimatedFee, rebondValue, staked, t]);
  const tx = useMemo(() => rebond?.(rebondValue), [rebond, rebondValue]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setRebondValue(valueAsBN);
  }, [decimal]);

  const onMaxValue = useMemo(() => {
    if (!unlockingAmount || !decimal) {
      return '0';
    }

    return unlockingAmount.toString();
  }, [decimal, unlockingAmount]);

  return {
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    rebondValue,
    setRebondValue,
    transactionInformation,
    tx,
    unlockingAmount
  };
};

export const useWithdrawClaimPool = (
  address: string | undefined,
  genesisHash: string | undefined,
  review: Review
) => {
  const { t } = useTranslation();

  const formatted = useFormatted3(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['nominationPools']['withdrawUnbonded'];
  const claimPayout = api?.tx['nominationPools']['claimPayout'];

  const [param, setParam] = useState<[string, number] | null | undefined>(null);

  const transferable = useMemo(() => {
    const asset = accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0');

    return getValue('transferable', asset);
  }, [accountAssets, genesisHash]);
  const redeemable = useMemo(() => stakingInfo.sessionInfo?.redeemAmount, [stakingInfo.sessionInfo?.redeemAmount]);
  const myClaimable = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.myClaimable as string | undefined ?? '0'), [stakingInfo.pool]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
      const spanCount = optSpans.isEmpty
        ? 0
        : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

      setParam([formatted, spanCount]);
    }).catch(console.error);
  }, [api, formatted, param]);

  const estimatedFee = useEstimatedFee2(review && param ? genesisHash ?? '' : undefined, formatted, review === Review.Reward ? claimPayout : redeem, review === Review.Reward ? undefined : param ?? [0]);

  const transactionInformation = useMemo(() => {
    return [{
      content: review === Review.Reward ? myClaimable : redeemable,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    (review === Review.Reward
      ? {
        content: myClaimable && transferable ? transferable.add(myClaimable) : undefined,
        description: t('Available balance after claiming rewards'),
        title: t('Available balance after'),
        withLogo: true
      }
      : {
        content: redeemable && transferable ? transferable.add(redeemable) : undefined,
        description: t('Available balance after redeemable withdrawal'),
        title: t('Available balance after'),
        withLogo: true
      })];
  }, [transferable, estimatedFee, redeemable, review, myClaimable, t]);
  const tx = useMemo(() => {
    if (review === Review.None) {
      return undefined;
    } else if (review === Review.Reward && claimPayout) {
      return claimPayout();
    } else if (review === Review.Withdraw && redeem && param) {
      return redeem(...param);
    } else {
      return undefined;
    }
  }, [review, claimPayout, redeem, param]);

  return {
    claimPayout,
    myClaimable,
    redeemable,
    transactionInformation,
    tx
  };
};

export const useWithdrawSolo = (
  address: string | undefined,
  genesisHash: string | undefined,
  review = false
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['staking']['withdrawUnbonded'];

  const [param, setParam] = useState<number | null | undefined>(null);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);
  const transferable = useMemo(() => getValue('transferable', asset), [asset]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
      const spanCount = optSpans.isEmpty
        ? 0
        : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

      setParam(spanCount as unknown as number);
    }).catch(console.error);
  }, [api, formatted, param]);

  const estimatedFee = useEstimatedFee2(review ? genesisHash ?? '' : undefined, formatted, redeem, [param ?? 0]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: redeemable,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: redeemable && transferable ? transferable.add(redeemable) : undefined,
      description: t('Available balance after redeemable withdrawal'),
      title: t('Available balance after'),
      withLogo: true
    }];
  }, [estimatedFee, redeemable, t, transferable]);
  const tx = useMemo(() => redeem?.(param), [redeem, param]);

  return {
    asset,
    redeemable,
    transactionInformation,
    tx
  };
};

export const useBondExtraSolo = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const bondExtra = api?.tx['staking']['bondExtra'];

  const [bondExtraValue, setBondExtraValue] = useState<BN | null | undefined>();

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, bondExtra, [bondExtraValue]);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);

  const errorMessage = useMemo(() => {
    if (!bondExtraValue || bondExtraValue.isZero() || !stakingInfo.availableBalanceToStake || !api) {
      return undefined;
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondExtraValue.gt(stakingInfo.availableBalanceToStake)) {
      return t('It is more than the available balance to stake.');
    }

    return undefined;
  }, [api, bondExtraValue, stakingInfo.availableBalanceToStake, t]);
  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: bondExtraValue,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: staked && bondExtraValue ? (staked as unknown as BN).add(bondExtraValue) : undefined,
      title: t('Total Stake After'),
      withLogo: true
    }];
  }, [bondExtraValue, estimatedFee, staked, t]);
  const tx = useMemo(() => bondExtra?.(bondExtraValue), [bondExtra, bondExtraValue]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setBondExtraValue(valueAsBN);
  }, [decimal]);

  const onMaxValue = useMemo(() => {
    if (!stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts?.existentialDeposit) {
      return '0';
    }

    return (stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2))).toString(); // TO-DO: check if this is correct
  }, [stakingInfo.availableBalanceToStake, stakingInfo.stakingConsts?.existentialDeposit]);

  return {
    availableBalanceToStake: stakingInfo.availableBalanceToStake,
    bondExtraValue,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setBondExtraValue,
    transactionInformation,
    tx
  };
};

export const useFastUnstaking = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const accountAssets = useAccountAssets(address);
  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const isExposed = useIsExposed2(genesisHash, stakingInfo);
  const formatted = useFormatted3(address, genesisHash);

  const transferable = useMemo(() => {
    const asset = accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0');

    return getValue('transferable', asset);
  }, [accountAssets, genesisHash]);

  const fastUnstake = api?.tx['fastUnstake']['registerFastUnstake'];
  const estimatedFee = useEstimatedFee2(genesisHash, formatted, fastUnstake?.());

  const fastUnstakeDeposit = api ? api.consts['fastUnstake']['deposit'] as unknown as BN : undefined;
  const hasEnoughDeposit = useMemo(() =>
    (fastUnstakeDeposit && estimatedFee && transferable)
      ? new BN(fastUnstakeDeposit).add(estimatedFee).lt(transferable || BN_ZERO)
      : undefined
  , [fastUnstakeDeposit, estimatedFee, transferable]);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const redeemable = stakingInfo.stakingAccount?.redeemable;

  const hasUnlockingAndRedeemable = useMemo(() => redeemable !== undefined && stakingInfo.stakingAccount
    ? !!(!redeemable.isZero() || stakingInfo.stakingAccount.unlocking?.length)
    : undefined
  , [redeemable, stakingInfo.stakingAccount]);

  const isEligible = useMemo(() => isExposed !== undefined && hasUnlockingAndRedeemable !== undefined && hasEnoughDeposit !== undefined
    ? !isExposed && !hasUnlockingAndRedeemable && hasEnoughDeposit
    : undefined, [hasEnoughDeposit, hasUnlockingAndRedeemable, isExposed]);

  const eligibilityCheck = useMemo(() => {
    return [
      { status: hasEnoughDeposit, text: t('Having {{deposit}} {{token}} available to deposit', { replace: { deposit: fastUnstakeDeposit ? amountToHuman(fastUnstakeDeposit, decimal) : ' ... ', token } }) },
      { status: hasUnlockingAndRedeemable !== undefined ? !hasUnlockingAndRedeemable : undefined, text: t('No redeemable or unstaking funds') },
      { status: isExposed !== undefined ? !isExposed : undefined, text: t('Not being rewarded in the past {{day}} days', { replace: { day: stakingInfo.stakingConsts?.bondingDuration ?? ' ... ' } }) }
    ];
  }, [decimal, fastUnstakeDeposit, hasEnoughDeposit, hasUnlockingAndRedeemable, isExposed, stakingInfo.stakingConsts?.bondingDuration, t, token]);

  const checkDone = useMemo(() => eligibilityCheck.every(({ status }) => status !== undefined), [eligibilityCheck]);

  const transactionInformation = useMemo(() => {
    return [{
      content: staked as unknown as BN,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: staked && transferable ? transferable.add(staked as unknown as BN) : undefined,
      title: t('Available balance after'),
      withLogo: true
    }];
  }, [transferable, estimatedFee, staked, t]);
  const tx = useMemo(() => fastUnstake?.(), [fastUnstake]);

  return {
    checkDone,
    eligibilityCheck,
    isEligible,
    transactionInformation,
    tx
  };
};

export const useBondExtraPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const bondExtra = api?.tx['nominationPools']['bondExtra'];

  const [bondAmount, setBondAmount] = useState<BN | null | undefined>();

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : new BN(stakingInfo.pool?.member?.points ?? 0), [stakingInfo.pool]);
  // const poolState = useMemo(() => String(stakingInfo.pool?.bondedPool?.state), [stakingInfo.pool?.bondedPool?.state]);

  const tx = useMemo(() => {
    if (!formatted || !bondExtra || !bondAmount) {
      return undefined;
    }

    return bondExtra({ FreeBalance: bondAmount });
  }, [bondAmount, bondExtra, formatted]);

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? bondExtra?.({ FreeBalance: bondAmount ?? BN_ONE }));

  const transactionInformation = useMemo(() => {
    return [{
      content: bondAmount,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      title: t('Fee')
    },
    {
      content: bondAmount && staked ? (staked as unknown as BN).add(bondAmount) : undefined,
      title: t('Total stake after'),
      withLogo: true
    }];
  }, [bondAmount, estimatedFee, staked, t]);

  const errorMessage = useMemo(() => {
    if (!bondAmount || !stakingInfo.availableBalanceToStake || !staked) {
      return undefined;
    }

    if (staked.isZero()) {
      return t('The account is fully unstaked, so can\'t stake until you withdraw entire unstaked/redeemable amount.');
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondAmount.gt(stakingInfo.availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    return undefined;
  }, [bondAmount, staked, stakingInfo.availableBalanceToStake, t]);

  const onMaxValue = useMemo(() => {
    if (!stakingInfo.pool || !formatted || !stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts || !staked || staked.isZero()) {
      return '0';
    }

    return (stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2))).toString(); // TO-DO: check if this is correct
  }, [formatted, staked, stakingInfo.availableBalanceToStake, stakingInfo.pool, stakingInfo.stakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : null;

    setBondAmount(valueAsBN);
  }, [decimal]);

  return {
    availableBalanceToStake: stakingInfo.availableBalanceToStake,
    bondAmount,
    errorMessage,
    estimatedFee,
    onInputChange,
    onMaxValue,
    setBondAmount,
    transactionInformation,
    tx
  };
};
