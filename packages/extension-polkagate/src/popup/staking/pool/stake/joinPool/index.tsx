// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, PButton, ShowBalance } from '../../../../../components';
import { useApi, useDecimal, useFormatted, usePoolConsts, usePools, useToken, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../../partials';
import { MAX_AMOUNT_LENGTH, PREFERRED_POOL_NAME } from '../../../../../util/constants';
import { PoolInfo, PoolStakingConsts } from '../../../../../util/types';
import { amountToHuman } from '../../../../../util/utils';
import PoolsTable from './partials/PoolsTable';
import Review from './Review';

interface State {
  api?: ApiPromise;
  availableBalance: Balance;
  poolStakingConsts: PoolStakingConsts;
}

export default function JoinPool(): React.ReactElement {
  const { t } = useTranslation();

  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const formatted = useFormatted(address);
  const api = useApi(address, state?.api);
  const poolStakingConsts = usePoolConsts(address, state?.poolStakingConsts);
  const history = useHistory();
  const pools = usePools(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const [stakeAmount, setStakeAmount] = useState<string | undefined>();
  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [filteredPools, setFilteredPools] = useState<PoolInfo[] | null | undefined>();
  const [searchedPools, setSearchedPools] = useState<PoolInfo[] | null | undefined>();
  const [poolsToShow, setPoolsToShow] = useState<PoolInfo[] | null | undefined>(); // filtered with selected at first
  const [totalNumberOfPools, setTotalNumberOfPools] = useState<number | undefined>();
  const [numberOfFetchedPools, setNumberOfFetchedPools] = useState<number>(0);
  const [incrementalPools, setIncrementalPools] = useState<PoolInfo[] | null>();
  const [amountAsBN, setAmountAsBN] = useState<BN>();

  // const amountAsBN = useMemo(() => decimal && new BN(parseFloat(stakeAmount ?? '0') * 10 ** decimal), [decimal, stakeAmount]);

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
    setAmountAsBN(new BN(parseFloat(value.length ? value.slice(0, MAX_AMOUNT_LENGTH) : '0') * 10 ** decimal));
  }, [decimal]);

  const onMinAmount = useCallback(() => {
    if (!poolStakingConsts || !decimal) {
      return;
    }

    poolStakingConsts.minJoinBond && decimal && setStakeAmount(amountToHuman(poolStakingConsts.minJoinBond.toString(), decimal));
    setAmountAsBN(poolStakingConsts.minJoinBond);
  }, [decimal, poolStakingConsts]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedMaxFee || !decimal) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(availableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setStakeAmount(maxToHuman);
    setAmountAsBN(max);
  }, [api, availableBalance, decimal, estimatedMaxFee]);

  const toReview = useCallback(() => {
    api && selectedPool && setShowReview(!showReview);
  }, [api, selectedPool, showReview]);

  useEffect(() => {
    window.addEventListener('totalNumberOfPools', (res) => setTotalNumberOfPools(res.detail));
    window.addEventListener('numberOfFetchedPools', (res) => setNumberOfFetchedPools(res.detail));
    window.addEventListener('incrementalPools', (res) => setIncrementalPools(res.detail));
  }, []);

  useEffect(() => {
    if (!incrementalPools) {
      return;
    }

    if (selectedPool === undefined) {
      const POLKAGATE_POOL = incrementalPools?.find((pool) => pool.metadata?.toLowerCase().includes(PREFERRED_POOL_NAME?.toLocaleLowerCase()));

      setSelectedPool(POLKAGATE_POOL);
    } else {
      const restOf = (searchedPools || filteredPools || incrementalPools)?.filter((p) => p.poolId !== selectedPool.poolId && p.bondedPool?.state.toString() === 'Open');

      setPoolsToShow([selectedPool, ...restOf]);
    }
  }, [filteredPools, incrementalPools, searchedPools, selectedPool]);

  useEffect(() => {
    if (!api || !availableBalance || !formatted) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api.createType('Balance', BN_ONE));
    }

    api && amountAsBN && api.tx.nominationPools.join(amountAsBN.toString(), BN_ONE).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    });

    api && api.tx.nominationPools.join(String(availableBalance), BN_ONE).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee));
    });
  }, [formatted, api, availableBalance, selectedPool, amountAsBN]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    !state?.availableBalance && api && formatted && void api.derive.balances?.all(formatted).then((b) => {
      setAvailableBalance(b.availableBalance);
    });
    state?.availableBalance && setAvailableBalance(state?.availableBalance);
  }, [formatted, api, state?.availableBalance]);

  useEffect(() => {
    if (!stakeAmount || !amountAsBN || !poolStakingConsts?.minJoinBond) {
      setNextBtnDisabled(true);

      return;
    }

    const amountNotInRange = amountAsBN.gt(availableBalance?.sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN.gte(poolStakingConsts.minJoinBond);

    setNextBtnDisabled(!selectedPool || !stakeAmount || stakeAmount === '0' || amountNotInRange);
  }, [amountAsBN, availableBalance, estimatedMaxFee, poolStakingConsts?.minJoinBond, selectedPool, stakeAmount]);

  return (
    <>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Join Pool')} withSteps={{ current: 1, total: 2 }} />
      <AmountWithOptions
        label={t<string>(`Amount (${token ?? '...'})`)}
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
        disabled={nextBtnDisabled || amountAsBN.isZero()}
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
