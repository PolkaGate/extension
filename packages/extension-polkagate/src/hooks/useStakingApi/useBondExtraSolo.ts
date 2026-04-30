// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletNominationPoolsPoolState } from '@polkadot/types/lookup';
import type { Content } from '../../partials/Review';
import type { MyPoolInfo, PoolInfo } from '../../util/types';

import { People, UserOctagon } from 'iconsax-react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { BN, BN_FIVE, BN_MAX_INTEGER, BN_ONE, BN_ZERO } from '@polkadot/util';

import { EasyStakeSide, type SelectedEasyStakingType } from '../../fullscreen/stake/util/utils';
import { getValue } from '../../popup/account/util';
import { INITIAL_POOL_FILTER_STATE, poolFilterReducer } from '../../popup/staking/partial/PoolFilter';
import { type RolesState, updateRoleReducer } from '../../popup/staking/pool-new/createPool/UpdateRoles';
import { getStakingAsset } from '../../popup/staking/utils';
import { amountToHuman, amountToMachine, calcPrice, isHexToBn, safeSubtraction } from '../../util';
import { DATE_OPTIONS, POLKAGATE_POOL_IDS } from '../../util/constants';
import useAccountAssets from '../useAccountAssets';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import useIsExposed from '../useIsExposed';
import usePool from '../usePool';
import usePoolConst from '../usePoolConst';
import usePoolStakingInfo from '../usePoolStakingInfo';
import useSoloStakingInfo from '../useSoloStakingInfo';
import useStakingConsts from '../useStakingConsts';
import useTokenPriceBySymbol from '../useTokenPriceBySymbol';
import useTranslation from '../useTranslation';



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
 