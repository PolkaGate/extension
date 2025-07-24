// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '@polkadot/extension-polkagate/util/types';
// @ts-ignore
import type { PalletNominationPoolsPoolState } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BN_FIVE, BN_ZERO } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../../components';
import { useBackground, useChainInfo, useEstimatedFee2, useFormatted3, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { amountToMachine } from '../../../../util/utils';
import Search from '../../components/Search';
import StakeAmountInput from '../../partial/StakeAmountInput';
import StakingActionButton from '../../partial/StakingActionButton';
import UpdateRoles, { type RolesState, updateRoleReducer } from './UpdateRoles';

interface PoolNameBoxProp {
  onInputChange: (input: string) => void;
  initName: string;
  enteredValue: string | undefined;
}

const PoolNameBox = ({ enteredValue, initName, onInputChange }: PoolNameBoxProp) => {
  const { t } = useTranslation();

  return useMemo(() =>
    <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', gap: '12px', p: '15px' }}>
      <Typography color='text.primary' textAlign='left' variant='B-1'>
        {t('Pool Name')}
      </Typography>
      <Search
        defaultValue={enteredValue}
        noSearchIcon
        onSearch={onInputChange}
        placeholder={initName}
        style={{ '> div': { backgroundColor: '#2224424D', border: '1px solid #2E2B52', borderRadius: '12px', height: 'fit-content', p: '6px' }, width: '100%' }}
      />
    </Stack>
  , [enteredValue, initName, onInputChange, t]);
};

export default function CreatePool () {
  useBackground('staking');

  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const navigate = useNavigate();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);

  const create = api?.tx['nominationPools']['create'];
  const batch = api?.tx['utility']['batch'];
  const setMetadata = api?.tx['nominationPools']['setMetadata'];

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

  const INITIAL_POOL_FILTER_STATE: RolesState = useMemo(() => ({
    bouncer: formatted ?? selectedAccount?.address,
    depositor: formatted ?? selectedAccount?.address ?? '', // can not be undefined nor null, so we use an empty string
    nominator: formatted ?? selectedAccount?.address,
    root: formatted ?? selectedAccount?.address
  }), [formatted, selectedAccount?.address]);

  const [review, setReview] = useState<boolean>(false);
  const [poolMetadata, setPoolMetadata] = useState<string | undefined>(undefined);
  const [bondAmount, setBondAmount] = useState<BN | undefined>(undefined);
  const [roles, setRoles] = useReducer(updateRoleReducer, INITIAL_POOL_FILTER_STATE);

  useEffect(() => {
    if (formatted) {
      setRoles(INITIAL_POOL_FILTER_STATE);
    }
  }, [INITIAL_POOL_FILTER_STATE, formatted]);

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

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? setMetadata?.(BN_FIVE, initName));

  const transactionInformation = useMemo(() => {
    return [{
      content: estimatedFee2,
      title: t('Fee')
    }];
  }, [estimatedFee2, t]);

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

  const onInputChange = useCallback((input: string) => setPoolMetadata(input), []);
  const onBack = useCallback(() => navigate('/pool/' + genesisHash + '/stake') as void, [genesisHash, navigate]);
  const openReview = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => {
    setReview((onReview) => !onReview);
    setBondAmount(undefined);
  }, []);

  const transactionFlow = useTransactionFlow({
    address: selectedAccount?.address,
    backPathTitle: t('Creating Pool'),
    closeReview,
    genesisHash: genesisHash ?? '',
    pool: poolToCreate,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <Motion style={{ height: 'calc(100% - 55px)' }} variant='slide'>
        <BackWithLabel
          onClick={onBack}
          stepCounter={{ currentStep: 1, totalSteps: 2 }}
          style={{ pb: 0 }}
          text={t('Create pool')}
        />
        <Stack direction='column' justifyContent='space-between' sx={{ mt: '16px', position: 'relative', px: '15px' }}>
          <PoolNameBox
            enteredValue={poolMetadata}
            initName={initName}
            onInputChange={onInputChange}
          />
          <StakeAmountInput
            buttonsArray={[{
              buttonName: t('Max'),
              value: onMaxValue
            },
            {
              buttonName: t('Min'),
              value: onMinValue
            }]}
            decimal={decimal}
            errorMessage={errorMessage}
            numberOnly
            onInputChange={onInputAmountChange}
            style={{ mb: '18px', mt: '8px' }}
            title={t('Amount') + ` (${token?.toUpperCase() ?? '--'})`}
            titleInColor={` (${token?.toUpperCase() ?? '--'})`}
          />
          <UpdateRoles
            address={formatted ?? selectedAccount?.address ?? ''}
            roles={roles}
            setRoles={setRoles}
          />
        </Stack>
        <StakingActionButton
          disabled={!bondAmount || bondAmount.isZero() || !!errorMessage || !api || !poolId}
          onClick={openReview}
          style={{ bottom: '18px', left: '15px', position: 'absolute', width: '345px' }}
          text={t('Next')}
        />
      </Motion>
    </Grid>
  );
}
