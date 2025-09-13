// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Forcing } from '@polkadot/types/interfaces';
// @ts-ignore
import type { PalletNominationPoolsPoolState } from '@polkadot/types/lookup';
import type { ExpandedRewards } from '../fullscreen/stake/type';
import type { Content } from '../partials/Review';
import type { MyPoolInfo, PoolInfo, RewardDestinationType } from '../util/types';

import { People, UserOctagon } from 'iconsax-react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { BN, BN_FIVE, BN_MAX_INTEGER, BN_ONE, BN_ZERO } from '@polkadot/util';

import { EasyStakeSide, type SelectedEasyStakingType } from '../fullscreen/stake/util/utils';
import { getValue } from '../popup/account/util';
import { INITIAL_POOL_FILTER_STATE, poolFilterReducer } from '../popup/staking/partial/PoolFilter';
import { type RolesState, updateRoleReducer } from '../popup/staking/pool-new/createPool/UpdateRoles';
import { getStakingAsset } from '../popup/staking/utils';
import { DATE_OPTIONS, POLKAGATE_POOL_IDS } from '../util/constants';
import { amountToHuman, amountToMachine, blockToDate, calcPrice, isHexToBn, safeSubtraction } from '../util/utils';
import useAccountAssets from './useAccountAssets';
import useChainInfo from './useChainInfo';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useEstimatedFee from './useEstimatedFee';
import useFormatted from './useFormatted';
import useIsExposed from './useIsExposed';
import usePendingRewards from './usePendingRewards';
import usePool from './usePool';
import usePoolConst from './usePoolConst';
import usePoolStakingInfo from './usePoolStakingInfo';
import useSoloStakingInfo from './useSoloStakingInfo';
import useStakingConsts from './useStakingConsts';
import useTokenPriceBySymbol from './useTokenPriceBySymbol';
import useTranslation from './useTranslation';

export const useUnstakingPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

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

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? unbonded?.(formatted ?? address ?? '', unstakingValue ?? BN_ONE));

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: unstakingValue,
      description: t('This amount will be redeemable on {{redeemDate}}, and your rewards will be automatically claimed.', { replace: { redeemDate } }),
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    },
    {
      content: unstakingValue && staked
        ? safeSubtraction((staked as unknown as BN).sub(unstakingValue))
        : undefined,
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
      const remained = api.createType('Balance', safeSubtraction(staked.sub(unstakingValue))).toHuman();
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
      const partial = safeSubtraction(staked.sub(stakingInfo.poolStakingConsts.minCreateBond));

      // If there's nothing above the minimum, return '0'
      return partial.toString();
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
  const formatted = useFormatted(address, genesisHash);

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

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? unbonded?.(unstakingValue ?? BN_ONE));

  const errorMessage = useMemo(() => {
    if (!unstakingValue || unstakingValue.isZero() || !staked || !api) {
      return undefined;
    }

    if (unstakingValue.gt(staked)) {
      return t('It is more than already staked.');
    }

    if (stakingInfo.stakingConsts && !staked.sub(unstakingValue).isZero() && !isStopStaking && staked.sub(unstakingValue).lt(stakingInfo.stakingConsts.minNominatorBond)) {
      const remained = api.createType('Balance', safeSubtraction(staked.sub(unstakingValue))).toHuman();
      const min = api.createType('Balance', stakingInfo.stakingConsts.minNominatorBond).toHuman();

      return t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } });
    }

    return undefined;
  }, [api, isStopStaking, staked, stakingInfo.stakingConsts, t, unstakingValue]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: unstakingValue,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    },
    {
      content: unstakingValue && staked
        ? safeSubtraction((staked).sub(unstakingValue))
        : undefined,
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
  const formatted = useFormatted(address, genesisHash);

  const rebond = api?.tx['staking']['rebond'];

  const [rebondValue, setRebondValue] = useState<BN | null | undefined>();

  const estimatedFee = useEstimatedFee(genesisHash, formatted, rebond, [rebondValue]);

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
  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: rebondValue,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
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

export const useWithdrawPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const formatted = useFormatted(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['nominationPools']['withdrawUnbonded'];

  const [param, setParam] = useState<[string, number] | null | undefined>(null);

  const transferable = useMemo(() => {
    const asset = getStakingAsset(accountAssets, genesisHash);

    return getValue('transferable', asset);
  }, [accountAssets, genesisHash]);
  const redeemable = useMemo(() => stakingInfo.sessionInfo?.redeemAmount, [stakingInfo.sessionInfo?.redeemAmount]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    try {
      api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
        const spanCount = optSpans.isEmpty
          ? 0
          : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

        setParam([formatted, spanCount]);
      }).catch(console.error);
    } catch (e) {
      console.log('slashingSpans is deprecated', e);
      setParam([formatted, 0]);
    }
  }, [api, formatted, param]);

  const tx = useMemo(() => {
    if (redeem && param) {
      return redeem(...param);
    }

    return undefined;
  }, [redeem, param]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: redeemable,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    },
    {
      content: redeemable && transferable ? transferable.add(redeemable) : undefined,
      description: t('Available balance after redeemable withdrawal'),
      title: t('Available balance after'),
      withLogo: true
    }];
  }, [transferable, estimatedFee, redeemable, t]);

  return {
    redeemable,
    transactionInformation,
    tx
  };
};

export const useClaimRewardPool = (
  address: string | undefined,
  genesisHash: string | undefined,
  restake: boolean
) => {
  const { t } = useTranslation();

  const formatted = useFormatted(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);

  const claimPayout = api?.tx['nominationPools']['claimPayout'];
  const bondExtra = api?.tx['nominationPools']['bondExtra'];

  const myClaimable = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.myClaimable as string | undefined ?? '0'), [stakingInfo.pool]);

  const tx = useMemo(() => {
    if (!restake && claimPayout) {
      return claimPayout();
    }

    if (restake && bondExtra && myClaimable) {
      return bondExtra({ Rewards: myClaimable });
    }

    return undefined;
  }, [bondExtra, claimPayout, myClaimable, restake]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: address,
      title: t('Account')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [t, address, estimatedFee]);

  return {
    myClaimable,
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
  const formatted = useFormatted(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['staking']['withdrawUnbonded'];

  const [param, setParam] = useState<number | null | undefined>(null);

  const asset = useMemo(() => getStakingAsset(accountAssets, genesisHash), [accountAssets, genesisHash]);
  const transferable = useMemo(() => getValue('transferable', asset), [asset]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    try {
      api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
        const spanCount = optSpans.isEmpty
          ? 0
          : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

        setParam(spanCount as unknown as number);
      }).catch(console.error);
    } catch (e) {
      console.log('slashingSpans is deprecated', e);
      setParam(0);
    }
  }, [api, formatted, param]);

  const estimatedFee = useEstimatedFee(review ? genesisHash : undefined, formatted, redeem, [param ?? 0]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: redeemable,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
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
  const formatted = useFormatted(address, genesisHash);

  const bondExtra = api?.tx['staking']['bondExtra'];

  const [bondExtraValue, setBondExtraValue] = useState<BN | null | undefined>();

  const estimatedFee = useEstimatedFee(genesisHash, formatted, bondExtra, [bondExtraValue]);

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
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    },
    {
      content: staked && bondExtraValue ? (staked as unknown as BN).add(bondExtraValue) : undefined,
      title: t('Total stake after'),
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

    const maxAmount = safeSubtraction(stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2)));

    return maxAmount.toString();
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
  const isExposed = useIsExposed(genesisHash, stakingInfo);
  const formatted = useFormatted(address, genesisHash);

  const transferable = useMemo(() => {
    const asset = getStakingAsset(accountAssets, genesisHash);

    return getValue('transferable', asset);
  }, [accountAssets, genesisHash]);

  const fastUnstake = api?.tx['fastUnstake']['registerFastUnstake'];
  const estimatedFee = useEstimatedFee(genesisHash, formatted, fastUnstake?.());

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

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: staked as unknown as BN,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
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
  const formatted = useFormatted(address, genesisHash);

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

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? bondExtra?.({ FreeBalance: bondAmount ?? BN_ONE }));

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: bondAmount,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
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

    const maxAmount = safeSubtraction(stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2)));

    return maxAmount.toString();
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

export const useSoloSettings = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const setPayee = api?.tx['staking']['setPayee'];

  const stashId = stakingInfo.stakingAccount?.stashId.toString() ?? formatted ?? address;
  const rewardDestinationAddress = stakingInfo.rewardDestinationAddress;
  const ED = stakingInfo.stakingConsts?.existentialDeposit;

  const [rewardDestinationType, setRewardDestinationType] = useState<RewardDestinationType>(undefined);
  const [specificAccount, setSpecificAccount] = useState<string | undefined>(undefined);

  const rewardType = useMemo(() => {
    if (!stakingInfo.stakingAccount) {
      return undefined;
    }

    // initialize settings
    const parsedStakingAccount = stakingInfo.stakingAccount;

    /** in Westend it is null recently if user has not staked yet */
    if (!parsedStakingAccount.rewardDestination) {
      return undefined;
    }

    const destinationType = Object.keys(parsedStakingAccount.rewardDestination)[0];

    if (destinationType === 'Staked') {
      return 'Staked';
    } else {
      return 'Others';
    }
  }, [stakingInfo.stakingAccount]);

  useEffect(() => {
    if (!stakingInfo.stakingAccount) {
      return;
    }

    setRewardDestinationType(rewardType);
  }, [rewardType, stakingInfo.stakingAccount]);

  const makePayee = useCallback((value: RewardDestinationType, account: string | undefined) => {
    if (!value) {
      return;
    }

    if (value === 'Staked') {
      return 'Staked';
    }

    if (account === stashId) {
      return 'Stash';
    }

    if (account) {
      return { Account: account };
    }

    return undefined;
  }, [stashId]);

  const rewardDestination = useMemo(() => makePayee(rewardDestinationType, specificAccount ?? rewardDestinationAddress ?? stashId), [makePayee, rewardDestinationAddress, rewardDestinationType, specificAccount, stashId]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, setPayee, [rewardDestination ?? 'Staked']);
  const changeToStake = useMemo(() => rewardType === 'Others' && rewardDestinationType === 'Staked', [rewardDestinationType, rewardType]);
  const nextDisabled = useMemo(() => rewardDestinationType === 'Others' && (rewardDestinationAddress === specificAccount || !specificAccount), [rewardDestinationAddress, rewardDestinationType, specificAccount]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: rewardDestinationType === 'Others' ? (specificAccount ?? rewardDestinationAddress ?? stashId) : 'Staked',
      title: t('Reward destination')
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, rewardDestinationAddress, rewardDestinationType, specificAccount, stashId, t]);
  const tx = useMemo(() => {
    return rewardDestination && setPayee
      ? setPayee(rewardDestination)
      : undefined;
  }, [rewardDestination, setPayee]);

  return {
    ED,
    changeToStake,
    nextDisabled,
    rewardDestinationAddress,
    rewardDestinationType,
    setRewardDestinationType,
    setSpecificAccount,
    specificAccount,
    transactionInformation,
    tx
  };
};

export const useJoinPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const { api, decimal } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const join = api?.tx['nominationPools']['join']; // (amount, poolId)

  const [filter, dispatchFilter] = useReducer(poolFilterReducer, INITIAL_POOL_FILTER_STATE);
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [bondAmount, setBondAmount] = useState<BN | undefined>(undefined);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>(undefined);

  const tx = useMemo(() => {
    if (!join || !bondAmount || !selectedPool) {
      return undefined;
    }

    return join(bondAmount, selectedPool.poolId);
  }, [bondAmount, join, selectedPool]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? join?.(bondAmount ?? BN_ONE, selectedPool?.poolId ?? 0));

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: bondAmount,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [bondAmount, estimatedFee, t]);

  const errorMessage = useMemo(() => {
    if (!bondAmount || !stakingInfo.availableBalanceToStake) {
      return undefined;
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondAmount.gt(stakingInfo.availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    if (bondAmount.lt(stakingInfo.poolStakingConsts?.minJoinBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to join a pool.');
    }

    return undefined;
  }, [bondAmount, stakingInfo.availableBalanceToStake, stakingInfo.poolStakingConsts?.minJoinBond, t]);

  const onMaxValue = useMemo(() => {
    if (!formatted || !stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts) {
      return '0';
    }

    const maxAmount = safeSubtraction(stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2)));

    return maxAmount.toString();
  }, [formatted, stakingInfo.availableBalanceToStake, stakingInfo.stakingConsts]);

  const onMinValue = useMemo(() => {
    if (!stakingInfo.poolStakingConsts) {
      return '0';
    }

    return stakingInfo.poolStakingConsts?.minJoinBond.toString();
  }, [stakingInfo.poolStakingConsts]);

  const onInputChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : BN_ZERO;

    setBondAmount(valueAsBN);
  }, [decimal, setBondAmount]);

  const onSearch = useCallback((query: string) => setSearchedQuery(query), []);

  return {
    availableBalanceToStake: stakingInfo.availableBalanceToStake,
    bondAmount,
    dispatchFilter,
    errorMessage,
    estimatedFee,
    filter,
    onInputChange,
    onMaxValue,
    onMinValue,
    onSearch,
    searchedQuery,
    selectedPool,
    setBondAmount,
    setSelectedPool,
    transactionInformation,
    tx
  };
};

export const useCreatePool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);

  const create = api?.tx['nominationPools']['create'];
  const batch = api?.tx['utility']['batch'];
  const setMetadata = api?.tx['nominationPools']['setMetadata'];

  const [poolMetadata, setPoolMetadata] = useState<string | undefined>(undefined);
  const [bondAmount, setBondAmount] = useState<BN | undefined>(undefined);

  const INITIAL_POOL_ROLES: RolesState = useMemo(() => ({
    bouncer: formatted ?? address,
    depositor: formatted ?? address ?? '', // can not be undefined nor null, so we use an empty string
    nominator: formatted ?? address,
    root: formatted ?? address
  }), [formatted, address]);

  const [roles, setRoles] = useReducer(updateRoleReducer, INITIAL_POOL_ROLES);

  useEffect(() => {
    if (formatted) {
      setRoles(INITIAL_POOL_ROLES);
    }
  }, [INITIAL_POOL_ROLES, formatted]);

  const poolId = useMemo(() => {
    if (!stakingInfo.poolStakingConsts?.lastPoolId) {
      return undefined;
    } else {
      return stakingInfo.poolStakingConsts.lastPoolId.addn(1);
    }
  }, [stakingInfo.poolStakingConsts?.lastPoolId]);

  const initName = useMemo(() => {
    const initialName = 'PolkaGate - ';
    const lastPoolId = poolId?.toString() ?? undefined;

    return initialName + lastPoolId;
  }, [poolId]);

  const errorMessage = useMemo(() => {
    if (!bondAmount || !stakingInfo.availableBalanceToStake) {
      return undefined;
    }

    if (stakingInfo.availableBalanceToStake.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (bondAmount.gt(stakingInfo.availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    if (bondAmount.lt(stakingInfo.poolStakingConsts?.minCreationBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to create a pool.');
    }

    return undefined;
  }, [bondAmount, stakingInfo.availableBalanceToStake, stakingInfo.poolStakingConsts?.minCreationBond, t]);

  const tx = useMemo(() => {
    if (!create || !bondAmount || !setMetadata || !batch || !poolId) {
      return undefined;
    }

    return batch([
      create(bondAmount, roles.root, roles.nominator, roles.bouncer),
      setMetadata(poolId, poolMetadata || initName)
    ]);
  }, [batch, bondAmount, create, initName, poolId, poolMetadata, roles.bouncer, roles.nominator, roles.root, setMetadata]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? setMetadata?.(BN_FIVE, initName));

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, t]);

  const onMaxValue = useMemo(() => {
    if (!formatted || !stakingInfo.availableBalanceToStake || !stakingInfo.stakingConsts) {
      return '0';
    }

    const maxAmount = safeSubtraction(stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2)));

    return maxAmount.toString();
  }, [formatted, stakingInfo.availableBalanceToStake, stakingInfo.stakingConsts]);

  const onMinValue = useMemo(() => {
    if (!stakingInfo.poolStakingConsts) {
      return '0';
    }

    return stakingInfo.poolStakingConsts?.minCreationBond.toString();
  }, [stakingInfo.poolStakingConsts]);

  const poolToCreate = useMemo(() => ({
    bondedPool: {
      memberCounter: 1,
      points: bondAmount,
      roles: {
        bouncer: roles.bouncer,
        depositor: roles.depositor,
        nominator: roles.nominator,
        root: roles.root
      },
      state: 'Creating' as unknown as PalletNominationPoolsPoolState
    },
    metadata: poolMetadata || initName,
    poolId,
    rewardPool: null
  }) as unknown as PoolInfo, [bondAmount, roles.bouncer, roles.depositor, roles.nominator, roles.root, poolMetadata, initName, poolId]);

  const onInputAmountChange = useCallback((value: string | null | undefined) => {
    const valueAsBN = value ? amountToMachine(value, decimal) : BN_ZERO;

    setBondAmount(valueAsBN);
  }, [decimal, setBondAmount]);

  const onMetadataInputChange = useCallback((input: string) => setPoolMetadata(input), []);

  return {
    bondAmount,
    errorMessage,
    estimatedFee,
    initName,
    onInputAmountChange,
    onMaxValue,
    onMetadataInputChange,
    onMinValue,
    poolId,
    poolMetadata,
    poolToCreate,
    roles,
    setBondAmount,
    setRoles,
    transactionInformation,
    tx
  };
};

export const usePoolDetail = (
  poolDetail: MyPoolInfo | null | undefined,
  genesisHash: string | undefined
) => {
  type CollapseState = Record<string, boolean>;

  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const price = useTokenPriceBySymbol(token ?? '', genesisHash ?? '');

  const collapseReducer = useCallback((state: CollapseState, action: { type: string }): CollapseState => {
    // Create new state where all sections are closed
    const newState: CollapseState = Object.keys(state).reduce((acc, key) => {
      // Only open the clicked section if it was previously closed
      acc[key] = key === action.type ? !state[action.type] : false;

      return acc;
    }, {} as CollapseState);

    return newState;
  }, []);

  const [collapse, dispatchCollapse] = useReducer(collapseReducer, { Ids: false, Members: false, Rewards: true, Roles: false });

  const unwrapRewardAccount = useCallback((rewardDestination: string | undefined) => {
    try {
      const parsed = rewardDestination ? JSON.parse(rewardDestination) as unknown : undefined;

      if (parsed && typeof parsed === 'object' && parsed !== null && 'account' in parsed) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return (parsed as { account?: string }).account;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }, []);

  const commission = useMemo(() => {
    const maybeCommission = poolDetail?.bondedPool?.commission?.current?.isSome ? poolDetail.bondedPool.commission.current.value[0] : 0;

    return Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);
  }, [poolDetail?.bondedPool?.commission]);

  const roles = useMemo(() => ({
    bouncer: poolDetail?.bondedPool?.roles.bouncer?.toString(),
    depositor: poolDetail?.bondedPool?.roles.depositor?.toString(),
    nominator: poolDetail?.bondedPool?.roles.nominator?.toString(),
    root: poolDetail?.bondedPool?.roles.root?.toString()
  }), [poolDetail]);

  const ids = useMemo(() => ({
    'reward ID': poolDetail?.accounts?.rewardId.toString() ?? unwrapRewardAccount(poolDetail?.stashIdAccount?.rewardDestination?.toString()),
    'stash ID': poolDetail?.accounts?.stashId.toString() ?? poolDetail?.stashIdAccount?.accountId.toString()
  }), [poolDetail?.accounts?.rewardId, poolDetail?.accounts?.stashId, poolDetail?.stashIdAccount?.accountId, poolDetail?.stashIdAccount?.rewardDestination, unwrapRewardAccount]);

  const poolStatus = useMemo(() => {
    if (!poolDetail) {
      return '';
    }

    const status = poolDetail.bondedPool?.state.toString();

    return status === 'Open'
      ? t('pool')
      : status === 'Destroying'
        ? t('destroying')
        : t('blocked');
  }, [poolDetail, t]);

  const totalPoolRewardAsFiat = useMemo(() => calcPrice(price.price, isHexToBn(poolDetail?.rewardClaimable?.toString() ?? '0') ?? BN_ZERO, decimal ?? 0), [decimal, poolDetail?.rewardClaimable, price.price]);

  const handleCollapses = useCallback((type: string) => () => dispatchCollapse({ type }), []);

  return {
    collapse,
    commission,
    handleCollapses,
    ids,
    poolStatus,
    roles,
    totalPoolRewardAsFiat
  };
};

export const useEasyStake = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const MAX_LETTER_THRESHOLD = 35;

  const { t } = useTranslation();

  const { api, chainName, decimal } = useChainInfo(genesisHash);
  const accountAssets = useAccountAssets(address);
  const poolStakingConsts = usePoolConst(genesisHash);
  const stakingConsts = useStakingConsts(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const bond = api?.tx['staking']['bond'];// (value: Compact<u128>, payee: PalletStakingRewardDestination)
  const batchAll = api?.tx['utility']['batchAll'];
  const nominated = api?.tx['staking']['nominate'];
  const join = api?.tx['nominationPools']['join']; // (amount, poolId)

  const polkagatePoolID = useMemo(() => {
    const chainUniqueName = chainName?.replaceAll('AssetHub', '');

    return chainUniqueName ? POLKAGATE_POOL_IDS[chainUniqueName] : undefined;
  }, [chainName]);

  const initialPool = usePool(address, polkagatePoolID ? genesisHash : undefined, polkagatePoolID);

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [amountAsBN, setAmountAsBN] = useState<BN | undefined>(undefined);
  const [topStakingLimit, setTopStakingLimit] = useState<BN | undefined>(undefined);
  const [side, setSide] = useState<EasyStakeSide>(EasyStakeSide.INPUT);
  const [selectedStakingType, setSelectedStakingType] = useState<SelectedEasyStakingType | undefined>(undefined);

  useEffect(() => {
    if (selectedStakingType || !initialPool) {
      return;
    }

    setSelectedStakingType({
      pool: initialPool,
      type: 'pool',
      validators: undefined
    });
  }, [initialPool, selectedStakingType, setSelectedStakingType]);

  const tx = useMemo(() => {
    if (!selectedStakingType || !bond || !nominated || !batchAll || !join) {
      return undefined;
    }

    if (selectedStakingType.type === 'solo' && selectedStakingType.validators) {
      return batchAll([
        bond(amountAsBN, 'Staked'),
        nominated(selectedStakingType.validators)
      ]);
    }

    if (selectedStakingType.type === 'pool' && selectedStakingType.pool) {
      return join(amountAsBN, selectedStakingType.pool.poolId);
    }

    return undefined;
  }, [amountAsBN, batchAll, bond, join, nominated, selectedStakingType]);
  // just a tx to estimate fee before users select their staking type
  const fakeTx = join?.(BN_ZERO, BN_ZERO);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? fakeTx);

  const transactionInformation: Content[] = useMemo((): Content[] => {
    return [{
      content: address,
      title: t('Account')
    },
    {
      Icon: selectedStakingType?.type === 'pool' ? People : UserOctagon,
      content: selectedStakingType?.type === 'pool' ? t('Pool Staking') : t('Solo Staking'),
      title: t('Staking type')
    },
    ...(selectedStakingType?.type === 'solo' && selectedStakingType.validators
      ? [{
        content: `${selectedStakingType.validators.length.toString()} / ${stakingConsts?.maxNominations}`,
        title: t('Validators')
      }]
      : []),
    ...(selectedStakingType?.type === 'pool' && selectedStakingType.pool
      ? [{
        content: selectedStakingType.pool.metadata?.slice(0, MAX_LETTER_THRESHOLD),
        title: t('Pool')
      }]
      : []),
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [address, estimatedFee, selectedStakingType?.pool, selectedStakingType?.type, selectedStakingType?.validators, stakingConsts?.maxNominations, t]);

  const token = useMemo(() => getStakingAsset(accountAssets, genesisHash), [accountAssets, genesisHash]);

  const availableBalanceToStake = useMemo(() => token?.freeBalance, [token?.freeBalance]);

  const thresholds = useMemo(() => {
    if (!decimal || !availableBalanceToStake || !poolStakingConsts || !stakingConsts || !estimatedFee) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;
    let max = safeSubtraction(availableBalanceToStake.sub(ED.muln(2)).sub(estimatedFee));

    let min = !selectedStakingType || selectedStakingType.type === 'pool' ? poolStakingConsts.minJoinBond : stakingConsts.minNominatorBond;

    if (min.gt(max)) {
      min = max = BN_ZERO;
    }

    return { max, min };
  }, [availableBalanceToStake, decimal, estimatedFee, poolStakingConsts, selectedStakingType, stakingConsts]);

  useEffect(() => {
    if (!thresholds?.max || topStakingLimit) {
      return;
    }

    setTopStakingLimit(thresholds.max);
  }, [thresholds?.max, topStakingLimit]);

  const onMaxMinAmount = useCallback((val: 'max' | 'min') => thresholds?.[val]?.toString(), [thresholds]);

  const errorMessage = useMemo(() => {
    if (token === null || availableBalanceToStake?.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (!amountAsBN || !amount) {
      return undefined;
    }

    if (amountAsBN.gt(topStakingLimit || BN_MAX_INTEGER)) {
      return t('It is more than top staking limit.');
    }

    if (amountAsBN.gt(availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    if (selectedStakingType?.type === 'pool' && amountAsBN.lt(poolStakingConsts?.minJoinBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to join a pool.');
    }

    if (selectedStakingType?.type === 'solo' && amountAsBN.lt(stakingConsts?.minNominatorBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to be a staker.');
    }

    return undefined;
  }, [amount, amountAsBN, availableBalanceToStake, poolStakingConsts?.minJoinBond, selectedStakingType?.type, stakingConsts?.minNominatorBond, t, token, topStakingLimit]);

  const onChangeAmount = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    // These lines have commented because user can not enter long number!
    // Already prevented in StakeAmountInput - onChange function
    // if (value.length > decimal - 1) {
    //   console.log(`The amount digits is more than decimal:${decimal}`);
    //   return;
    // }

    setAmountAsBN(amountToMachine(value, decimal));
    setAmount(value);
  }, [decimal]);

  const buttonDisable = useMemo(() => {
    return !amount || !amountAsBN || !topStakingLimit || parseFloat(amount) === 0 || amountAsBN.gt(topStakingLimit) || errorMessage;
  }, [amount, amountAsBN, errorMessage, topStakingLimit]);

  return {
    amount,
    amountAsBN,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    initialPool,
    onChangeAmount,
    onMaxMinAmount,
    selectedStakingType,
    setAmount,
    setSelectedStakingType,
    setSide,
    side,
    stakingConsts,
    transactionInformation,
    tx
  };
};

export const usePendingRewardsSolo = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const formatted = useFormatted(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const currentBlock = useCurrentBlockNumber(genesisHash);
  const pendingRewards = usePendingRewards(address, genesisHash);

  const payoutStakers = api?.tx['staking']['payoutStakersByPage'];
  const batch = api?.tx['utility']['batchAll'];

  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [selectedToPayout, setSelectedToPayout] = useState<ExpandedRewards[]>([]);
  const [expandedRewards, setExpandedRewards] = useState<ExpandedRewards[] | undefined>(undefined);

  useEffect(() => {
    if (!api?.derive?.staking) {
      return;
    }

    api.derive.session.progress().then(setProgress).catch(console.error);
    api.query['staking']['forceEra']().then((f) => setForcing(f as Forcing)).catch(console.error);

    api.query['staking']?.['historyDepth']
      ? api.query['staking']['historyDepth']().then((depth) => setHistoryDepth(depth as unknown as BN)).catch(console.error)
      : setHistoryDepth(api.consts['staking']['historyDepth'] as unknown as BN);
  }, [api?.consts, api?.derive.session, api?.derive?.staking, api?.query]);

  useEffect(() => {
    if (!pendingRewards) {
      return;
    }

    const rewardsArray: [string, string, number, BN][] = Object.entries(pendingRewards || {}).reduce<[string, string, number, BN][]>(
      (acc, [era, eraRewards]) => {
        const eraRewardsArray = Object.entries(eraRewards || {}).reduce<[string, string, number, BN][]>(
          (eraAcc, [validator, [page, amount]]) => {
            eraAcc.push([era, validator, page, amount]);

            return eraAcc;
          }, []);

        return acc.concat(eraRewardsArray);
      }, []);

    setExpandedRewards(rewardsArray);
  }, [pendingRewards]);

  const eraToDate = useCallback((era: number): string | undefined => {
    if (!(currentBlock && historyDepth && era && forcing && progress && progress.sessionLength.gt(BN_ONE))) {
      return undefined;
    }

    const EndEraInBlock =
      (forcing.isForceAlways
        ? progress.sessionLength
        : progress.eraLength
      ).mul(
        historyDepth
          .sub(progress.activeEra)
          .addn(era)
          .add(BN_ONE)
      ).sub(
        forcing.isForceAlways
          ? progress.sessionProgress
          : progress.eraProgress);

    return EndEraInBlock ? blockToDate(EndEraInBlock.addn(currentBlock).toNumber(), currentBlock, undefined, true) : undefined;
  }, [currentBlock, forcing, historyDepth, progress]);

  const totalSelectedPending = useMemo(() => {
    if (!selectedToPayout?.length) {
      return BN_ZERO;
    }

    return selectedToPayout.reduce((sum: BN, value: ExpandedRewards) => sum.add((value)[3]), BN_ZERO);
  }, [selectedToPayout]);

  const adaptiveDecimalPoint = totalSelectedPending && decimal && (String(totalSelectedPending).length >= decimal - 1 ? 2 : 4);

  const tx = useMemo(() => {
    if (!selectedToPayout.length || !payoutStakers || !batch) {
      return undefined;
    }

    const call = selectedToPayout.length > 1
      ? batch
      : payoutStakers;

    const params = selectedToPayout.length > 1
      ? [selectedToPayout.map((p) => payoutStakers(p[1], Number(p[0]), p[2]))]
      : [selectedToPayout[0][1], Number(selectedToPayout[0][0]), selectedToPayout[0][2]];

    return call(...params);
  }, [batch, payoutStakers, selectedToPayout]);

  const fakeTx = useMemo(() => payoutStakers?.(address, BN_ZERO, BN_ZERO), [address, payoutStakers]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? fakeTx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: totalSelectedPending,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, totalSelectedPending, t]);

  const onSelectAll = useCallback((checked: boolean) => {
    if (!checked && expandedRewards?.length) {
      setSelectedToPayout([...expandedRewards]);
    } else {
      setSelectedToPayout([]);
    }
  }, [expandedRewards]);

  const onSelect = useCallback((info: ExpandedRewards, checked: boolean) => {
    if (!checked) {
      setSelectedToPayout((prev) => prev.concat([info]));
    } else {
      const index = selectedToPayout.findIndex((s: ExpandedRewards) => s === info);

      setSelectedToPayout((prev) => {
        const newArray = [...prev];

        newArray.splice(index, 1);

        return newArray;
      });
    }
  }, [selectedToPayout]);

  return {
    adaptiveDecimalPoint,
    eraToDate,
    estimatedFee,
    expandedRewards,
    onSelect,
    onSelectAll,
    selectedToPayout,
    totalSelectedPending,
    transactionInformation,
    tx
  };
};
