// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';

import { useMemo } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { getValue } from '../../popup/account/util';
import { getStakingAsset } from '../../popup/staking/utils';
import { amountToHuman } from '../../util';
import useAccountAssets from '../useAccountAssets';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import useIsExposed from '../useIsExposed';
import useSoloStakingInfo from '../useSoloStakingInfo';
import useTranslation from '../useTranslation';

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
