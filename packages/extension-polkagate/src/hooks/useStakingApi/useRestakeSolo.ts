// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
 import type { Content } from '../../partials/Review';

import { useCallback, useMemo, useState } from 'react';

import { amountToMachine } from '../../util';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import useSoloStakingInfo from '../useSoloStakingInfo';
import useTranslation from '../useTranslation';

export { useUnstakingPool } from './useUnstakingPool';
export { useUnstakingSolo } from './useUnstakingSolo';

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
