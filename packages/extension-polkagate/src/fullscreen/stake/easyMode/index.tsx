// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { BalancesInfo } from '../../../util/types';
import type { StakingInputs } from '../type';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN_MAX_INTEGER, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Infotip2, ShowBalance, ShowBalance3, TwoButtons, Warning } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useInfo, usePool, usePoolConsts, useStakingConsts } from '../../../hooks';
import { POLKAGATE_POOL_IDS } from '../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../util/utils';
import { STEPS } from '..';

interface Props {
  address: string
  balances: BalancesInfo | undefined;
  inputs: StakingInputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>
}

export default function EasyMode ({ address, balances, inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chainName, decimal, formatted } = useInfo(address);
  const pool = usePool(address, POLKAGATE_POOL_IDS[chainName as string]);

  const poolConsts = usePoolConsts(address);
  const stakingConsts = useStakingConsts(address);

  const [amount, setAmount] = useState<string>(inputs?.extraInfo?.['amount'] as string);
  const [amountAsBN, setAmountAsBN] = useState<BN>(BN_ZERO);
  const [isNextClicked, setNextIsClicked] = useState<boolean>();
  const [topStakingLimit, setTopStakingLimit] = useState<BN>();
  const [alert, setAlert] = useState<string | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();

  const freeBalance = useMemo(() => balances?.freeBalance, [balances?.freeBalance]);

  const buttonDisable = useMemo(() => {
    return !amount || !amountAsBN || !topStakingLimit || parseFloat(amount) === 0 || amountAsBN.gt(topStakingLimit);
  }, [amount, amountAsBN, topStakingLimit]);

  const isBusy = !inputs?.extraInfo?.['amount'] && isNextClicked;

  useEffect(() => {
    if (!amountAsBN || !amount) {
      return setAlert(undefined);
    }

    if (amountAsBN.gt(topStakingLimit || BN_MAX_INTEGER)) {
      return setAlert(t('It is more than top staking limit.'));
    }

    return setAlert(undefined);
  }, [amount, amountAsBN, topStakingLimit, t]);

  useEffect(() => {
    if (!api || !freeBalance || !formatted) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedMaxFee(api.createType('Balance', BN_ONE) as Balance);
    }

    // FixMe: why bondExtra and not join?
    amountAsBN && api.tx['nominationPools']['bondExtra']({ FreeBalance: freeBalance.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);
  }, [formatted, api, freeBalance, amount, decimal, amountAsBN]);

  useEffect(() => {
    if (amount && amountAsBN && poolConsts && pool && api && amountAsBN.gte(poolConsts.minJoinBond)) {
      const call = api.tx['nominationPools']['join'];
      const params = [amountAsBN, pool.poolId];

      const extraInfo = {
        action: 'Easy Staking',
        amount,
        poolName: pool.metadata,
        subAction: 'stake'
      };

      pool && setInputs({
        call,
        extraInfo,
        mode: STEPS.EASY_STAKING,
        params,
        pool
      });
    }
  }, [amount, amountAsBN, api, pool, poolConsts, setInputs]);

  const onChangeAmount = useCallback((value: string) => {
    if (!balances) {
      return;
    }

    if (value.length > balances.decimal - 1) {
      console.log(`The amount digits is more than decimal:${balances.decimal}`);

      return;
    }

    setInputs(undefined);
    setAmount(value);
    setAmountAsBN(amountToMachine(value, balances.decimal));
  }, [balances, setInputs]);

  const thresholds = useMemo(() => {
    if (!stakingConsts || !decimal || !estimatedMaxFee || !freeBalance || !poolConsts) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;
    let max = freeBalance.sub(ED.muln(2)).sub(estimatedMaxFee);

    let min = poolConsts.minJoinBond;

    if (min.gt(max)) {
      min = max = BN_ZERO;
    }

    setTopStakingLimit(max);

    return { max, min };
  }, [freeBalance, decimal, estimatedMaxFee, poolConsts, stakingConsts]);

  const onThresholdAmount = useCallback((maxMin: 'max' | 'min') => {
    if (!thresholds || !decimal) {
      return;
    }

    setInputs(undefined);

    setAmount(amountToHuman(thresholds[maxMin].toString(), decimal));
    setAmountAsBN(thresholds[maxMin]);
  }, [thresholds, decimal, setInputs]);

  const onMaxClick = useCallback(
    () => onThresholdAmount('max')
    , [onThresholdAmount]);

  const onMinClick = useCallback(
    () => onThresholdAmount('min')
    , [onThresholdAmount]);

  const onNextClick = useCallback(() => {
    setNextIsClicked(true);
  }, []);

  const goToReview = useCallback(
    () => setStep(STEPS.EASY_REVIEW)
    , [setStep]);

  const backToDetail = useCallback(
    () => address && setStep(STEPS.INDEX)
    , [address, setStep]);

  useEffect(() => {
    isNextClicked && !isBusy && goToReview();
  }, [goToReview, isBusy, isNextClicked]);

  const Warn = ({ text }: { text: string }) => {
    const theme = useTheme();

    return (
      <Grid container sx={{ '> div': { mr: '0', mt: 0, pl: '5px' } }}>
        <Warning
          fontWeight={400}
          iconDanger
          isBelowInput
          theme={theme}
        >
          {text}
        </Warning>
      </Grid>
    );
  };

  return (
    <Grid container item>
      <Typography fontSize='16px' fontWeight={500} pb='15px' width='100%'>
        {t('Start your staking journey here! Stake your tokens to earn rewards while actively contributing to the security and integrity of the blockchain.')}
      </Typography>
      <Grid alignItems='center' container item justifyContent='flex-start' pt='20px'>
        <AmountWithOptions
          label={t('How much are you looking to stake?')}
          labelFontSize='16px'
          onChangeAmount={onChangeAmount}
          onPrimary={onMaxClick}
          onSecondary={onMinClick}
          primaryBtnText={t('Max amount')}
          secondaryBtnText={t('Min amount')}
          style={{
            fontSize: '16px',
            mt: '15px',
            width: '73%'
          }}
          textSpace='15px'
          value={amount}
        />
        {alert &&
          <Warn text={alert} />
        }
        <Grid container item pb='10px'>
          <Grid container item justifyContent='space-between' sx={{ mt: '10px', width: '58.25%' }}>
            <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
              <Infotip2 showInfoMark text={t('The maximum amount you can stake, considering the existential deposit and future transaction fees.')}>
                {t('Top staking limit')}
              </Infotip2>
            </Grid>
            <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
              <ShowBalance balance={topStakingLimit} decimal={decimal} decimalPoint={2} token={balances?.token} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px', width: '58.25%' }}>
            <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
              {t('Minimum to earn rewards')}
            </Grid>
            <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
              <ShowBalance3 address={address} balance={poolConsts?.minJoinBond} />
            </Grid>
          </Grid>
        </Grid>
        <Grid container item justifyContent='flex-start' mt='30px' xs={12}>
          <Grid item xs={12}>
            <Divider
              sx={{
                bgcolor: 'transparent',
                border: `0.5px solid ${theme.palette.divider}`,
                mt: '40px',
                width: '100%'
              }}
            />
          </Grid>
          <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
            <TwoButtons
              disabled={buttonDisable}
              isBusy={isBusy}
              mt='1px'
              onPrimaryClick={onNextClick}
              onSecondaryClick={backToDetail}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Back')}
            />
            {isBusy &&
              <Typography sx={{ fontSize: '15px' }}>
                {t('Please wait while we are fetching information!')}
              </Typography>
            }
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
