// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { MyPoolInfo, PoolStakingConsts, StakingConsts } from '../../../../util/types';

import { faPersonCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AutoDelete as AutoDeleteIcon } from '@mui/icons-material';
import { Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useApi, useChain, useDecimal, useFormatted, usePool, usePoolConsts, useStakingConsts, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DATE_OPTIONS, DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import Asset from '../../../send/partial/Asset';
import ShowPool from '../../partial/ShowPool';
import SetState from '../pool/SetState';
import Review from './Review';
import RemoveAll from '../pool/removeAll';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  poolConsts: PoolStakingConsts | undefined;
  stakingConsts: StakingConsts;
  myPool: MyPoolInfo | undefined;
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const api = useApi(address, state?.api);
  const chain = useChain(address);
  const [refresh, setRefresh] = useState<boolean>(false);
  const myPool = usePool(address, undefined, state?.myPool, refresh);
  const formatted = useFormatted(address);
  const poolConsts = usePoolConsts(address, state?.poolConsts);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [helperText, setHelperText] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [unstakeAllAmount, setUnstakeAllAmount] = useState<boolean>(false);
  const [helperButton, setShowHelperButton] = useState<number>(0);
  const [goChange, setGoChange] = useState<boolean>(false);

  const staked = useMemo(() => {
    if (myPool && myPool.member?.points && myPool.stashIdAccount && myPool.bondedPool) {
      return (new BN(myPool.member.points).mul(new BN(String(myPool.stashIdAccount.stakingLedger.active)))).div(new BN(myPool.bondedPool.points));
    } else {
      return BN_ZERO;
    }
  }, [myPool]);
  const decimal = useDecimal(address) ?? DEFAULT_TOKEN_DECIMALS;
  const token = useToken(address) ?? '...';
  const totalAfterUnstake = useMemo(() => staked && staked.sub(amountToMachine(amount, decimal)), [amount, decimal, staked]);
  const unlockingLen = myPool?.stashIdAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;
  const isPoolRoot = useMemo(() => String(formatted) === String(myPool?.bondedPool?.roles?.root), [formatted, myPool?.bondedPool?.roles?.root]);
  const isPoolDepositor = useMemo(() => String(formatted) === String(myPool?.bondedPool?.roles?.depositor), [formatted, myPool?.bondedPool?.roles?.depositor]);
  const poolState = useMemo(() => String(myPool?.bondedPool?.state), [myPool?.bondedPool?.state]);
  const poolMemberCounter = useMemo(() => Number(myPool?.bondedPool?.memberCounter), [myPool?.bondedPool?.memberCounter]);
  const destroyHelperText = t<string>('No one can join and all members can be removed without permissions. Once in destroying state, it cannot be reverted to another state.');

  const unbonded = api && api.tx.nominationPools.unbond;
  const poolWithdrawUnbonded = api && api.tx.nominationPools.poolWithdrawUnbonded;
  const redeemDate = useMemo(() => {
    if (stakingConsts) {
      const date = Date.now() + stakingConsts.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingConsts]);

  useEffect(() => {
    if (!amount) {
      return;
    }

    const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimal - FLOATING_POINT_DIGIT)));

    if (amountAsBN.gt(staked ?? BN_ZERO)) {
      return setAlert(t('It is more than already staked.'));
    }

    if (api && staked && poolConsts && !staked.sub(amountAsBN).isZero() && !unstakeAllAmount && staked.sub(amountAsBN).lt(poolConsts.minJoinBond)) {
      const remained = api.createType('Balance', staked.sub(amountAsBN)).toHuman();
      const min = api.createType('Balance', poolConsts.minJoinBond).toHuman();

      return setAlert(t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } }));
    }

    setAlert(undefined);
  }, [amount, api, poolConsts, decimal, staked, t, unstakeAllAmount]);

  useEffect(() => {
    const params = [formatted, amountToMachine(amount, decimal)];

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    poolWithdrawUnbonded && maxUnlockingChunks && unlockingLen !== undefined && unbonded && formatted && void unbonded(...params).paymentInfo(formatted).then((i) => {
      const fee = i?.partialFee;

      if (unlockingLen < maxUnlockingChunks) {
        setEstimatedFee(fee);
      } else {
        const dummyParams = [1, 1];

        // eslint-disable-next-line no-void
        void poolWithdrawUnbonded(...dummyParams).paymentInfo(formatted).then((j) => setEstimatedFee(api.createType('Balance', fee.add(j?.partialFee))));
      }
    }).catch(console.error);
  }, [amount, api, decimal, formatted, maxUnlockingChunks, poolWithdrawUnbonded, unbonded, unlockingLen]);

  useEffect(() => {
    if (!myPool || !formatted || !poolConsts || !staked) {
      return;
    }

    const partial = staked.sub(poolConsts.minCreateBond);

    if (isPoolDepositor && isPoolRoot && poolState !== 'Destroying' && partial.isZero()) {
      setHelperText(t<string>('You need to change the pool state to Destroying first to be able to unstake.'));
      setShowHelperButton(1);
    }

    if (isPoolDepositor && isPoolRoot && poolState === 'Destroying' && poolMemberCounter !== 1 && partial.isZero()) {
      setHelperText(t<string>('You need to remove all members first to be able to unstake.'));
      setShowHelperButton(2);
    }
  }, [formatted, isPoolDepositor, isPoolRoot, myPool, poolConsts, poolMemberCounter, poolState, staked, t]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/',
      state: { ...state }
    });
  }, [history, state]);

  const onChangeAmount = useCallback((value: string) => {
    setUnstakeAllAmount(false);

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!myPool || !formatted || !poolConsts || !staked || staked.isZero()) {
      return;
    }

    if (isPoolRoot && poolState === 'Destroying' && poolMemberCounter === 1) {
      setUnstakeAllAmount(true);
      setAmount(amountToHuman(staked.toString(), decimal));
    }

    if (isPoolDepositor && poolState === 'Destroying' && poolMemberCounter === 1) {
      setUnstakeAllAmount(true);
      setAmount(amountToHuman(staked, decimal));
    }

    if (isPoolDepositor && (poolState !== 'Destroying' || poolMemberCounter !== 1)) {
      const partial = staked.sub(poolConsts.minCreateBond);

      setUnstakeAllAmount(false);
      !partial.isZero() && setAmount(amountToHuman(partial, decimal));
    }

    if (!isPoolDepositor && !isPoolRoot) {
      setUnstakeAllAmount(true);
      setAmount(amountToHuman(staked.toString(), decimal));
    }
  }, [decimal, formatted, isPoolDepositor, isPoolRoot, myPool, poolConsts, poolMemberCounter, poolState, staked]);

  const goToReview = useCallback(() => {
    setShowReview(true);
  }, []);

  const goToDestroying = useCallback(() => {
    helperButton === 1 && setGoChange(!goChange);
  }, [goChange, helperButton]);

  const goToRemoveAll = useCallback(() => {
    helperButton === 2 && setGoChange(!goChange);
  }, [goChange, helperButton]);

  const Warn = ({ text, isDanger, iconDanger }: { text: string; isDanger?: boolean; iconDanger?: boolean; }) => (
    <Grid color='red' container sx={{ 'div.belowInput': { m: '5px 0 -8px', p: 0 }, 'div.belowInput.danger': { m: 0, mt: '10px' } }}>
      <Warning
        fontWeight={400}
        iconDanger={iconDanger}
        isBelowInput
        isDanger={isDanger}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={onBackClick}
        paddingBottom={0}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle
        label={t('Unstake')}
        withSteps={{ current: 1, total: 2 }}
      />
      {helperText &&
        <Grid container height='78px' justifyContent='center' m='auto' width='92%'>
          <Warn isDanger text={helperText} />
          {helperButton &&
            <Button onClick={helperButton === 1 ? goToDestroying : goToRemoveAll}
              startIcon={
                helperButton === 1
                  ? (
                    <AutoDeleteIcon
                      sx={{ color: 'text.primary', fontSize: '21px' }}
                    />)
                  : (
                    <FontAwesomeIcon
                      color={theme.palette.text.primary}
                      fontSize='18px'
                      icon={faPersonCircleXmark}
                    />)
              }
              sx={{
                color: 'text.primary',
                fontWeight: 400,
                fontSize: '14px',
                mt: '50px',
                textDecorationLine: 'underline',
                textTransform: 'capitalize'
              }}
              variant='text'
            >
              {helperButton === 1 ? t<string>('Destroying') : t<string>('RemoveAll')}
            </Button>}
        </Grid>
      }
      <Grid item sx={{ mx: '15px' }} xs={12}>
        <Asset api={api} balance={staked} balanceLabel={t('Staked')} fee={estimatedFee} genesisHash={chain?.genesisHash} style={{ pt: '20px' }} />
        <div style={{ paddingTop: '15px' }}>
          <AmountWithOptions
            disabled={!!helperButton}
            label={t<string>('Amount ({{token}})', { replace: { token } })}
            onChangeAmount={onChangeAmount}
            onPrimary={onAllAmount}
            primaryBtnText={t<string>('All amount')}
            value={amount}
          />
          {alert &&
            <Warn iconDanger text={alert} />
          }
        </div>
      </Grid>
      <ShowPool
        api={api}
        chain={chain}
        label={t<string>('Pool')}
        mode='Default'
        pool={myPool}
        showInfo
        style={{
          m: '15px auto 0',
          width: '92%'
        }}
      />
      {!helperButton &&
        <Typography fontSize='16px' fontWeight={400} m='20px 0 0' textAlign='center'>
          {t<string>('Your rewards wil be automatically withdrawn.')}
        </Typography>}
      <PButton
        _onClick={goToReview}
        disabled={!amount || amount === '0'}
        text={t<string>('Next')}
      />
      {showReview && amount && api && formatted && maxUnlockingChunks &&
        <Review
          address={address}
          amount={amount}
          api={api}
          chain={chain}
          estimatedFee={estimatedFee}
          formatted={formatted}
          maxUnlockingChunks={maxUnlockingChunks}
          poolId={myPool?.poolId}
          poolWithdrawUnbonded={poolWithdrawUnbonded}
          redeemDate={redeemDate}
          setShow={setShowReview}
          show={showReview}
          total={totalAfterUnstake}
          unbonded={unbonded}
          unlockingLen={unlockingLen ?? 0}
        />
      }
      {goChange && helperButton === 1 && myPool && formatted &&
        <SetState
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          headerText={t<string>('Destroy Pool')}
          helperText={destroyHelperText}
          pool={myPool}
          setRefresh={setRefresh}
          setShow={setGoChange}
          show={goChange}
          state={'Destroying'}
        />
      }
      {goChange && helperButton === 2 && myPool && formatted &&
        <RemoveAll
          address={address}
          api={api}
          pool={myPool}
          setRefresh={setRefresh}
          setShowRemoveAll={setGoChange}
          showRemoveAll={goChange}
        />
      }
    </Motion>
  );
}
