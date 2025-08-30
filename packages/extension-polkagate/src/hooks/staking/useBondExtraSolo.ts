// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { Content } from '../../partials/Review';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { amountToMachine } from '../../util/utils';
import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import useSoloStakingInfo from '../useSoloStakingInfo';

const useBondExtraSolo = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const bondExtra = api?.tx['staking']['bondExtra'];

  const [bondExtraValue, setBondExtraValue] = useState<BN | null | undefined>();

  const estimatedFee = useEstimatedFee2(genesisHash, formatted, bondExtra, [bondExtraValue]);

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

export default useBondExtraSolo;
