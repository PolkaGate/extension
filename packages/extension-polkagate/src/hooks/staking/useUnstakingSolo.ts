// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { Content } from '../../partials/Review';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BN_ONE } from '@polkadot/util';

import { amountToMachine, safeSubtraction } from '../../util/utils';
import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import useSoloStakingInfo from '../useSoloStakingInfo';

const useUnstakingSolo = (
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
      content: unstakingValue && staked ? safeSubtraction((staked).sub(unstakingValue)) : undefined,
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

export default useUnstakingSolo;
