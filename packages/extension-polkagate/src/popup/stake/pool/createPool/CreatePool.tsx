// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, InputWithLabel, InputWithLabelAndIdenticon, PButton, ShowBalance } from '../../../../components';
import { useApi, useChain, useFormatted, usePoolConsts, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { PoolInfo, PoolStakingConsts } from '../../../../util/types';
import { amountToHuman } from '../../../../util/utils';
import UpdateRoles from './UpdateRoles';
import Review from './Review';

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
  const token = api?.registry?.chainTokens[0] ?? '...';
  const decimals = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
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
  const [stateTogglerId, setStateTogglerId] = useState<string>();
  const [newPool, setNewPool] = useState<PoolInfo | undefined>();

  const amountAsBN = useMemo(() => new BN(parseFloat(createAmount ?? '0') * 10 ** decimals), [decimals, createAmount]);
  const nextPoolId = poolStakingConsts && poolStakingConsts.lastPoolId.toNumber() + 1;
  const DEFAULT_POOLNAME = `Polkagate 💜${nextPoolId ? ` - ${nextPoolId}` : ''}`;

  const backToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const stakeAmountChange = useCallback((value: string) => {
    if (value.length > decimals - 1) {
      console.log(`The amount digits is more than decimal:${decimals}`);

      return;
    }

    setCreateAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimals]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedMaxFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(availableBalance.toString()).sub(ED.muln(3)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimals);

    maxToHuman && setCreateAmount(maxToHuman);
  }, [api, availableBalance, decimals, estimatedMaxFee]);

  const onMinAmount = useCallback(() => {
    poolStakingConsts?.minCreationBond && setCreateAmount(amountToHuman(poolStakingConsts.minCreationBond.toString(), decimals));
  }, [decimals, poolStakingConsts?.minCreationBond]);

  const _onPoolNameChange = useCallback((name: string) => {
    setPoolName(name);
  }, []);

  const onUpdateRoles = useCallback(() => {
    setShowRoles(!showRoles);
  }, [showRoles]);

  const toReview = useCallback(() => {
    setNewPool({
      bondedPool: {
        memberCounter: 1,
        points: amountAsBN,
        roles: {
          depositor: formatted,
          nominator: nominatorId,
          root: formatted,
          stateToggler: stateTogglerId
        },
        state: 'Creating'
      },
      metadata: poolName ?? DEFAULT_POOLNAME,
      poolId: poolStakingConsts?.lastPoolId?.addn(1),
      rewardPool: null
    });
    setShowReview(!showReview);
  }, [DEFAULT_POOLNAME, amountAsBN, formatted, nominatorId, poolName, poolStakingConsts?.lastPoolId, showReview, stateTogglerId]);

  useEffect(() => {
    !nominatorId && formatted && setNominatorId(formatted);
    !stateTogglerId && formatted && setStateTogglerId(formatted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted]);

  useEffect(() => {
    if (!poolStakingConsts?.minCreationBond) {
      return;
    }

    const goTo = !(formatted && nominatorId && stateTogglerId && createAmount);
    const isAmountInRange = amountAsBN.gt(availableBalance?.sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN.gte(poolStakingConsts.minCreationBond);

    setToReviewDisabled(goTo || isAmountInRange);
  }, [amountAsBN, availableBalance, createAmount, estimatedMaxFee, formatted, nominatorId, poolName, poolStakingConsts?.minCreationBond, stateTogglerId]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    !state?.availableBalance && api && formatted && void api.derive.balances?.all(formatted).then((b) => {
      setAvailableBalance(b.availableBalance);
    });
    state?.availableBalance && setAvailableBalance(state?.availableBalance);
  }, [formatted, api, state?.availableBalance]);

  useEffect(() => {
    if (!api || !availableBalance || !formatted) { return; }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api.createType('Balance', BN_ONE));
    }

    api && amountAsBN && api.tx.nominationPools.create(String(amountAsBN), formatted, nominatorId, stateTogglerId).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    });

    api && api.tx.nominationPools.create(String(availableBalance), formatted, nominatorId, stateTogglerId).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee));
    });
  }, [formatted, api, availableBalance, createAmount, decimals, amountAsBN, nominatorId, stateTogglerId]);

  return (
    <>
      <HeaderBrand onBackClick={backToStake} shortBorder showBackArrow showClose text={t<string>('Pool Staking')} />
      <SubTitle label={t<string>('Create Pool')} withSteps={{ current: 1, total: 2 }} />
      <Grid container m='20px auto 10px' width='92%'>
        <InputWithLabel label={t<string>('Pool name')} onChange={_onPoolNameChange} placeholder={DEFAULT_POOLNAME} value={poolName} />
      </Grid>
      <AmountWithOptions label={t<string>(`Amount(${ token ?? '...'})`)} onChangeAmount={stakeAmountChange} onPrimary={onMinAmount} onSecondary={onMaxAmount} primaryBtnText={t<string>('Min amount')} secondaryBtnText={t<string>('Max amount')} style={{ m: '10px auto', width: '92%' }} value={createAmount} />
      <Grid alignItems='end' container sx={{ m: '0 auto 10px', width: '92%' }}>
        <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
          {t<string>('Fee:')}
        </Typography>
        <Grid item lineHeight='22px' pl='5px'>
          <ShowBalance api={api} balance={estimatedFee} decimalPoint={4} height={22} />
        </Grid>
      </Grid>
      <Typography fontSize='16px' fontWeight={400} lineHeight='36px' sx={{ my: '10px' }} textAlign='center'>
        {t<string>('Roles')}
      </Typography>
      <Typography fontSize='14px' fontWeight={300} sx={{ m: 'auto', width: '90%' }} textAlign='left'>
        {t<string>('All the roles (Depositor, Root, Nominator, and State toggler) are set to the following ID by default although you can update the Nominator and State toggler by clicking on “Update roles”.')}
      </Typography>
      <InputWithLabelAndIdenticon address={formatted} chain={chain} disabled label={''} setAddress={() => null} showIdenticon style={{ m: '15px auto 0', width: '92%' }} />
      <Grid ml='4%' onClick={onUpdateRoles} width='fit-content'>
        <Typography fontSize='16px' fontWeight={400} lineHeight='36px' sx={{ cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
          {t<string>('Update roles')}
        </Typography>
      </Grid>
      <PButton _onClick={toReview} disabled={toReviewDisabled} text={t<string>('Next')} />
      {showRoles &&
        <UpdateRoles address={address} chain={chain} formatted={formatted} nominatorId={nominatorId} setNominatorId={setNominatorId} setShow={setShowRoles} setStateTogglerId={setStateTogglerId} show={showRoles} stateTogglerId={stateTogglerId} />
      }
      {showReview && newPool &&
        <Review address={address} api={api} createAmount={amountAsBN} estimatedFee={estimatedFee} poolToCreate={newPool} setShowReview={setShowReview} showReview={showReview} />
      }
    </>
  );
}
