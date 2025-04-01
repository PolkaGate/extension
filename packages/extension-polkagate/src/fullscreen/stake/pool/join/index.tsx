// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PoolInfo } from '../../../../util/types';
import type { StakingInputs } from '../../type';

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, ShowBalance, TwoButtons } from '../../../../components';
import { useBalances, useEstimatedFee, useInfo, usePoolConsts, usePools, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { MAX_AMOUNT_LENGTH, PREFERRED_POOL_NAME, STAKING_CHAINS } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import { STEPS } from '../..';
import PoolsTable from '../partials/PoolsTable';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>;
  inputs: StakingInputs | undefined;
}

export default function JoinPool ({ inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);
  const freeBalance = useBalances(address)?.freeBalance;

  useUnSupportedNetwork(address, STAKING_CHAINS);
  const { api, decimal, formatted, genesisHash, token } = useInfo(address);
  const poolStakingConsts = usePoolConsts(address);

  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools(address);

  const [stakeAmount, setStakeAmount] = useState<string | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>();
  const [filteredPools, setFilteredPools] = useState<PoolInfo[] | null | undefined>();
  const [searchedPools, setSearchedPools] = useState<PoolInfo[] | null | undefined>();
  const [poolsToShow, setPoolsToShow] = useState<PoolInfo[] | null | undefined>(); // filtered with selected at first
  const [amountAsBN, setAmountAsBN] = useState<BN>();

  const onBack = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  useEffect(() => {
    // go back on chain switch
    if (genesisHash && api?.genesisHash && String(api.genesisHash) !== genesisHash) {
      onBack();
    }
  }, [api?.genesisHash, genesisHash, onBack]);

  const stakeAmountChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setStakeAmount(value.slice(0, MAX_AMOUNT_LENGTH));
    setAmountAsBN(amountToMachine(value.length ? value.slice(0, MAX_AMOUNT_LENGTH) : '0', decimal));
  }, [decimal]);

  const onMinAmount = useCallback(() => {
    if (!poolStakingConsts || !decimal) {
      return;
    }

    poolStakingConsts.minJoinBond && decimal && setStakeAmount(amountToHuman(poolStakingConsts.minJoinBond.toString(), decimal));
    setAmountAsBN(poolStakingConsts.minJoinBond);
  }, [decimal, poolStakingConsts]);

  const onMaxAmount = useCallback(() => {
    if (!api || !freeBalance || !estimatedMaxFee || !decimal) {
      return;
    }

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;
    const max = new BN(freeBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setStakeAmount(maxToHuman);
    setAmountAsBN(max);
  }, [api, freeBalance, decimal, estimatedMaxFee]);

  const toReview = useCallback(() => {
    api && selectedPool && setStep(STEPS.JOIN_REVIEW);
  }, [api, selectedPool, setStep]);

  useEffect(() => {
    if (!incrementalPools) {
      return;
    }

    if (selectedPool === undefined) {
      const POLKAGATE_POOL = incrementalPools?.find((pool) => pool.metadata?.toLowerCase().includes(PREFERRED_POOL_NAME?.toLowerCase()));

      setSelectedPool(POLKAGATE_POOL);
    } else {
      const restOf = (searchedPools || filteredPools || incrementalPools)?.filter((p) => p.poolId !== selectedPool.poolId && p.bondedPool?.state.toString() === 'Open');

      setPoolsToShow([selectedPool, ...restOf]);
    }
  }, [filteredPools, incrementalPools, searchedPools, selectedPool]);

  useEffect(() => {
    if (!api || !freeBalance || !formatted) {
      return;
    }

    api.tx['nominationPools']['join'](String(freeBalance), BN_ONE).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);
  }, [formatted, api, freeBalance, selectedPool, amountAsBN, poolStakingConsts]);

  useEffect(() => {
    if (!stakeAmount || !amountAsBN || !poolStakingConsts?.minJoinBond) {
      setNextBtnDisabled(true);

      return;
    }

    const amountNotInRange = amountAsBN.gt(freeBalance?.sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN.gte(poolStakingConsts.minJoinBond);

    setNextBtnDisabled(!selectedPool || !stakeAmount || stakeAmount === '0' || amountNotInRange);
  }, [amountAsBN, freeBalance, estimatedMaxFee, poolStakingConsts?.minJoinBond, selectedPool, stakeAmount]);

  useEffect(() => {
    if (!api || !selectedPool || !stakeAmount) {
      return;
    }

    const call = api.tx['nominationPools']['join'];
    const params = [amountAsBN, selectedPool.poolId];
    const extraInfo = {
      action: 'Pool Staking',
      amount: stakeAmount,
      fee: String(estimatedFee || 0),
      poolName: selectedPool.metadata,
      subAction: 'Join Pool'
    };

    setInputs({
      call,
      estimatedFee, // TODO: needs to include setMetadata
      extraInfo,
      mode: STEPS.JOIN_POOL,
      params,
      pool: selectedPool
    });
  }, [amountAsBN, api, decimal, estimatedFee, selectedPool, setInputs, stakeAmount]);

  return (
    <>
      <AmountWithOptions
        label={t('Amount ({{token}})', { replace: { token: token || '...' } })}
        onChangeAmount={stakeAmountChange}
        onPrimary={onMinAmount}
        onSecondary={onMaxAmount}
        primaryBtnText={t('Min amount')}
        secondaryBtnText={t('Max amount')}
        style={{
          fontSize: '16px',
          mt: '15px',
          width: '73%'
        }}
        textSpace='15px'
        value={stakeAmount}
      />
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: '57.5%' }}>
        <Grid container item justifyContent='space-between' sx={{ mt: '10px' }}>
          <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
            {t('Available Balance')}
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <ShowBalance balance={freeBalance} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px' }}>
          <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
            {t('Network fee')}
          </Grid>
          <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
            <ShowBalance api={api} balance={estimatedFee} />
          </Grid>
        </Grid>
      </Grid>
      <PoolsTable
        address={address}
        api={api}
        filteredPools={filteredPools}
        maxHeight={window.innerHeight - 420}
        minHeight={window.innerHeight - 420}
        numberOfFetchedPools={numberOfFetchedPools}
        pools={incrementalPools}
        poolsToShow={poolsToShow}
        selected={selectedPool}
        setFilteredPools={setFilteredPools}
        setSearchedPools={setSearchedPools}
        setSelected={setSelectedPool}
        style={{
          m: '15px auto 0',
          width: '100%'
        }}
        totalNumberOfPools={totalNumberOfPools}
      />
      <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '10px' }}>
        <TwoButtons
          disabled={nextBtnDisabled || amountAsBN?.isZero()}
          // isBusy={isBusy}
          mt='1px'
          onPrimaryClick={toReview}
          onSecondaryClick={onBack}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Back')}
        />
      </Grid>
    </>
  );
}
