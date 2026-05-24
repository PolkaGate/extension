// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';

import { useCallback, useMemo, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { amountToMachine, safeSubtraction } from '../../util';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import usePoolStakingInfo from '../usePoolStakingInfo';
import useTranslation from '../useTranslation';

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
