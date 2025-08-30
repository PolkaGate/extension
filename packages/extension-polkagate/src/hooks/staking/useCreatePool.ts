// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { PalletNominationPoolsPoolState } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { Content } from '../../partials/Review';
import type { PoolInfo } from '../../util/types';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BN_FIVE, BN_ZERO } from '@polkadot/util';

import { type RolesState, updateRoleReducer } from '../../popup/staking/pool-new/createPool/UpdateRoles';
import { amountToMachine } from '../../util/utils';
import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import usePoolStakingInfo from '../usePoolStakingInfo';

const useCreatePool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const { api, decimal } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);
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

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? setMetadata?.(BN_FIVE, initName));

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

    return (stakingInfo.availableBalanceToStake.sub(stakingInfo.stakingConsts.existentialDeposit.muln(2))).toString(); // TO-DO: check if this is correct
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

export default useCreatePool;
