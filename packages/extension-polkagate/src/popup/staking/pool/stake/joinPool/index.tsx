// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { PoolInfo, PoolStakingConsts } from '../../../../../util/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, PButton, ShowBalance } from '../../../../../components';
import { useBalances, useInfo, usePoolConsts, usePools, useTranslation, useUnSupportedNetwork } from '../../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../../partials';
import { MAX_AMOUNT_LENGTH, PREFERRED_POOL_NAME, STAKING_CHAINS } from '../../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../../util/utils';
import PoolsTable from './partials/PoolsTable';
import Review from './Review';

interface State {
  api?: ApiPromise;
  availableBalance: Balance;
  poolStakingConsts: PoolStakingConsts;
}

export default function JoinPool (): React.ReactElement {
  const { t } = useTranslation();

  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const { api, decimal, formatted, token } = useInfo(address);
  const freeBalance = useBalances(address)?.freeBalance;

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const poolStakingConsts = usePoolConsts(address, state?.poolStakingConsts);
  const history = useHistory();

  const { incrementalPools, numberOfFetchedPools, totalNumberOfPools } = usePools(address);

  const [stakeAmount, setStakeAmount] = useState<string | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [filteredPools, setFilteredPools] = useState<PoolInfo[] | null | undefined>();
  const [searchedPools, setSearchedPools] = useState<PoolInfo[] | null | undefined>();
  const [poolsToShow, setPoolsToShow] = useState<PoolInfo[] | null | undefined>(); // filtered with selected at first
  const [amountAsBN, setAmountAsBN] = useState<BN>();

  const backToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { api, consts: poolStakingConsts, pool: null }
    });
  }, [address, api, history, poolStakingConsts]);

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
    api && selectedPool && setShowReview(!showReview);
  }, [api, selectedPool, showReview]);

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

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api.createType('Balance', BN_ONE) as Balance);
    }

    const maybeAmount = amountAsBN || poolStakingConsts?.minJoinBond;

    maybeAmount && api.tx['nominationPools']['join'](maybeAmount.toString(), BN_ONE).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);

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

  return (
    <>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle
        label={t<string>('Join Pool')}
        withSteps={{ current: 1, total: 2 }}
      />
      <AmountWithOptions
        label={t<string>('Amount ({{token}})', { replace: { token: token || '...' } })}
        onChangeAmount={stakeAmountChange}
        onPrimary={onMinAmount}
        onSecondary={onMaxAmount}
        primaryBtnText={t<string>('Min amount')}
        secondaryBtnText={t<string>('Max amount')}
        style={{
          m: '20px auto 7px',
          width: '92%'
        }}
        value={stakeAmount}
      />
      <Grid alignItems='end' container sx={{ m: 'auto', width: '92%' }}>
        <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
          {t<string>('Fee:')}
        </Typography>
        <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShowBalance
            api={api}
            balance={estimatedFee}
            decimalPoint={4}
            height={22}
          />
        </Grid>
      </Grid>
      <PoolsTable
        address={address}
        api={api}
        filteredPools={filteredPools}
        maxHeight={window.innerHeight - 345}
        numberOfFetchedPools={numberOfFetchedPools}
        pools={incrementalPools}
        poolsToShow={poolsToShow}
        selected={selectedPool}
        setFilteredPools={setFilteredPools}
        setSearchedPools={setSearchedPools}
        setSelected={setSelectedPool}
        style={{
          m: '15px auto 0',
          width: '92%'
        }}
        totalNumberOfPools={totalNumberOfPools}
      />
      <PButton
        _onClick={toReview}
        disabled={nextBtnDisabled || amountAsBN?.isZero()}
        text={t<string>('Next')}
      />
      {showReview && selectedPool && api && amountAsBN &&
        <Review
          address={address}
          api={api}
          estimatedFee={estimatedFee}
          joinAmount={amountAsBN}
          poolToJoin={selectedPool}
          setShowReview={setShowReview}
          showReview={showReview}
        />
      }
    </>
  );
}
