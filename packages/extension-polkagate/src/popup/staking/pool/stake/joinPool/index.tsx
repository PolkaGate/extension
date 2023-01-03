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
import { useApi, useDecimal, useFormatted, usePool, usePoolConsts, usePools, useToken, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, MAX_AMOUNT_LENGTH, PREFERRED_POOL_NAME } from '../../../../../util/constants';
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
  const [sortedPools, setSortedPools] = useState<PoolInfo[] | null | undefined>();
  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);

  const amountAsBN = useMemo(() => decimal && new BN(parseFloat(stakeAmount ?? '0') * 10 ** decimal), [decimal, stakeAmount]);
  // const poolToJoin = usePool(address, selectedPool?.poolId?.toNumber());

  const backToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { api, consts: poolStakingConsts, pool: null }
    });
  }, [address, api, history, poolStakingConsts]);

  const stakeAmountChange = useCallback((value: string) => {
    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setStakeAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onMinAmount = useCallback(() => {
    poolStakingConsts?.minJoinBond && decimal && setStakeAmount(amountToHuman(poolStakingConsts.minJoinBond.toString(), decimal));
  }, [decimal, poolStakingConsts?.minJoinBond]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedMaxFee || !decimal) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(availableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setStakeAmount(maxToHuman);
  }, [api, availableBalance, decimal, estimatedMaxFee]);

  const toReview = useCallback(() => {
    api && selectedPool && setShowReview(!showReview);
  }, [api, selectedPool, showReview]);

  useEffect(() => {
    if (!pools) {
      return;
    }

    if (selectedPool === undefined) {
      const POLKAGATE_POOL = pools?.find((pool) => pool.metadata?.toLowerCase().includes(PREFERRED_POOL_NAME?.toLocaleLowerCase()));

      setSelectedPool(POLKAGATE_POOL);
    } else {
      // const bringFront = pools.filter((pool) => pool.poolId === selectedPool.poolId)[0];
      const restOf = pools.filter((pool) => pool.poolId !== selectedPool.poolId && pool.bondedPool?.state.toString() === 'Open');

      setSortedPools([selectedPool, ...restOf]);
    }
  }, [pools, selectedPool]);

  useEffect(() => {
    if (!api || !availableBalance || !formatted) { return; }

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
      <SubTitle label={t<string>('Join Pool')} />
      <AmountWithOptions
        label={t<string>(`Amount (${token ?? '...'})`)}
        onChangeAmount={stakeAmountChange}
        onPrimary={onMinAmount}
        onSecondary={onMaxAmount}
        primaryBtnText={t<string>('Min amount')}
        secondaryBtnText={t<string>('Max amount')}
        style={{
          m: '20px auto 10px',
          width: '92%'
        }}
        value={stakeAmount}
      />
      <Grid alignItems='end' container sx={{ m: 'auto', width: '92%' }}>
        <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
          {t<string>('Fee:')}
        </Typography>
        <Grid item lineHeight='22px' pl='5px'>
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
        label={t<string>('Choose a pool to join')}
        maxHeight={window.innerHeight - 350}
        pools={sortedPools}
        selected={selectedPool}
        setSelected={setSelectedPool}
        style={{
          m: '15px auto 0',
          width: '92%'
        }}
      />
      <PButton
        // _isBusy={poolToJoin?.poolId ? Number(poolToJoin.poolId) !== selectedPool?.poolId?.toNumber() : false || !!pools}
        _onClick={toReview}
        disabled={nextBtnDisabled}
        text={t<string>('Next')}
      />
      {showReview && selectedPool && api && amountAsBN &&
        // poolToJoin?.poolId && Number(poolToJoin.poolId) === selectedPool?.poolId?.toNumber() && api && amountAsBN &&
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
