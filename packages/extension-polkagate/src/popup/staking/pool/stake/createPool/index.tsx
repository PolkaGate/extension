// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolRoles, PalletNominationPoolsPoolState } from '@polkadot/types/lookup';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AddressInput, AmountWithOptions, InputWithLabel, PButton, ShowBalance } from '../../../../../components';
import { useApi, useChain, useDecimal, useFormatted, usePoolConsts, useToken, useTranslation, useUnSupportedNetwork } from '../../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../../partials';
import { MAX_AMOUNT_LENGTH, STAKING_CHAINS } from '../../../../../util/constants';
import type { PoolInfo, PoolStakingConsts } from '../../../../../util/types';
import { amountToHuman, amountToMachine } from '../../../../../util/utils';
import Review from './Review';
import UpdateRoles from './UpdateRoles';

interface State {
  api?: ApiPromise;
  availableBalance: Balance;
  poolStakingConsts: PoolStakingConsts;
}

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const formatted = useFormatted(address);
  const api = useApi(address, state?.api);
  const history = useHistory();
  const token = useToken(address);
  const decimal = useDecimal(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const poolStakingConsts = usePoolConsts(address, state?.poolStakingConsts);
  const chain = useChain(address);

  const [poolName, setPoolName] = useState<string | undefined>();
  const [createAmount, setCreateAmount] = useState<string | undefined>();
  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [showRoles, setShowRoles] = useState<boolean>(false);
  const [toReviewDisabled, setToReviewDisabled] = useState<boolean>(true);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [nominatorId, setNominatorId] = useState<string>();
  const [bouncerId, setBouncerId] = useState<string>();
  const [newPool, setNewPool] = useState<PoolInfo | undefined>();

  const ED = api && api.consts['balances']['existentialDeposit'] as unknown as BN;
  const nextPoolId = poolStakingConsts && poolStakingConsts.lastPoolId.toNumber() + 1;
  const DEFAULT_POOLNAME = `PolkaGate 💜${nextPoolId ? ` - ${nextPoolId}` : ''}`;
  // const amountAsBN = useMemo(() => ED && (new BN(parseFloat(createAmount ?? '0') * 10 ** decimal)).sub(ED), [ED, createAmount, decimal]);
  const amountAsBN = useMemo(() => amountToMachine(createAmount, decimal), [createAmount, decimal]);

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

    setCreateAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedMaxFee || !ED) {
      return;
    }

    const max = new BN(availableBalance.toString()).sub(ED.muln(3)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setCreateAmount(maxToHuman);
  }, [ED, api, availableBalance, decimal, estimatedMaxFee]);

  const onMinAmount = useCallback(() => {
    poolStakingConsts?.minCreationBond && setCreateAmount(amountToHuman(poolStakingConsts.minCreationBond.toString(), decimal));
  }, [decimal, poolStakingConsts?.minCreationBond]);

  const _onPoolNameChange = useCallback((name: string) => {
    setPoolName(name);
  }, []);

  const onUpdateRoles = useCallback(() => {
    setShowRoles(!showRoles);
  }, [showRoles]);

  const toReview = useCallback(() => {
    setNewPool({
      bondedPool: {
        memberCounter: 1 as any,
        points: amountAsBN as any,
        roles: {
          depositor: formatted as any,
          nominator: nominatorId as any,
          root: formatted as any,
          bouncer: bouncerId as any
        } as PalletNominationPoolsPoolRoles,
        state: 'Creating' as unknown as PalletNominationPoolsPoolState
      } as PalletNominationPoolsBondedPoolInner,
      metadata: poolName ?? DEFAULT_POOLNAME,
      poolId: poolStakingConsts?.lastPoolId?.addn(1) as any,
      rewardPool: null
    });
    setShowReview(!showReview);
  }, [DEFAULT_POOLNAME, amountAsBN, formatted, nominatorId, poolName, poolStakingConsts?.lastPoolId, showReview, bouncerId]);

  useEffect(() => {
    !nominatorId && formatted && setNominatorId(String(formatted));
    !bouncerId && formatted && setBouncerId(String(formatted));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted]);

  useEffect(() => {
    if (!poolStakingConsts?.minCreateBond) {
      return;
    }

    const goTo = !(formatted && nominatorId && bouncerId && createAmount);
    const isAmountInRange = amountAsBN?.gt(availableBalance?.sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN?.gte(poolStakingConsts.minCreateBond);

    setToReviewDisabled(goTo || isAmountInRange);
  }, [amountAsBN, availableBalance, createAmount, estimatedMaxFee, formatted, nominatorId, poolStakingConsts?.minCreateBond, bouncerId]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    !state?.availableBalance && api && formatted && void api.derive.balances?.all(formatted).then((b) => {
      setAvailableBalance(b.availableBalance);
    });
    state?.availableBalance && setAvailableBalance(state?.availableBalance);
  }, [formatted, api, state?.availableBalance]);

  useEffect(() => {
    if (!api || !availableBalance || !formatted) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api.createType('Balance', BN_ONE) as Balance);
    }

    api && api.tx['nominationPools']['create'](String(amountAsBN.gte(BN_ONE) ? amountAsBN : BN_ONE), formatted, nominatorId, bouncerId).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);

    api && api.tx['nominationPools']['create'](String(availableBalance), formatted, nominatorId, bouncerId).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee));
    }).catch(console.error);
  }, [amountAsBN, api, availableBalance, formatted, nominatorId, bouncerId]);

  return (
    <>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Create Pool')} withSteps={{ current: 1, total: 2 }} />
      <Grid container m='20px auto 10px' width='92%'>
        <InputWithLabel label={t<string>('Pool name')} onChange={_onPoolNameChange} placeholder={DEFAULT_POOLNAME} value={poolName} />
      </Grid>
      <AmountWithOptions
        label={t<string>('Amount ({{token}})', { replace: { token: token || '...' } })}
        onChangeAmount={stakeAmountChange}
        onPrimary={onMinAmount}
        onSecondary={onMaxAmount}
        primaryBtnText={t<string>('Min amount')}
        secondaryBtnText={t<string>('Max amount')}
        style={{ m: '10px auto', width: '92%' }}
        value={createAmount}
      />
      <Grid alignItems='end' container sx={{ m: '0 auto 10px', width: '92%' }}>
        <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
          {t<string>('Fee:')}
        </Typography>
        <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShowBalance api={api} balance={estimatedFee} decimalPoint={4} height={22} />
        </Grid>
      </Grid>
      <Typography fontSize='16px' fontWeight={400} lineHeight='36px' sx={{ my: '10px' }} textAlign='center'>
        {t<string>('Roles')}
      </Typography>
      <Typography fontSize='14px' fontWeight={300} sx={{ m: 'auto', width: '90%' }} textAlign='left'>
        {t<string>('All the roles (Depositor, Root, Nominator, and Bouncer) are set to the following ID by default although you can update the Nominator and Bouncer by clicking on “Update roles”.')}
      </Typography>
      <AddressInput address={formatted} chain={chain as any} disabled label={''} setAddress={() => null} showIdenticon style={{ m: '15px auto 0', width: '92%' }} />
      <Grid ml='4%' onClick={onUpdateRoles} width='fit-content'>
        <Typography fontSize='16px' fontWeight={400} lineHeight='36px' sx={{ cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
          {t<string>('Update roles')}
        </Typography>
      </Grid>
      <PButton _onClick={toReview} disabled={toReviewDisabled} text={t<string>('Next')} />
      {showRoles &&
        <UpdateRoles
          address={address}
          bouncerId={bouncerId}
          chain={chain as any}
          formatted={formatted}
          nominatorId={nominatorId}
          setBouncerId={setBouncerId}
          setNominatorId={setNominatorId}
          setShow={setShowRoles}
          show={showRoles}
        />
      }
      {showReview && newPool &&
        <Review
          address={address}
          api={api as ApiPromise}
          createAmount={amountAsBN}
          estimatedFee={estimatedFee}
          poolToCreate={newPool}
          setShowReview={setShowReview}
          showReview={showReview}
        />
      }
    </>
  );
}
