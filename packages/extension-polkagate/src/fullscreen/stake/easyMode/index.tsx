// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, ShowBalance, TwoButtons } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useInfo, useMinToReceiveRewardsInSolo2, usePool, usePoolConsts, useStakingConsts, useValidatorSuggestion } from '../../../hooks';
import { BalancesInfo } from '../../../util/types';
import { amountToHuman, amountToMachine } from '../../../util/utils';
import { Inputs } from '../Entry';
import { STEPS } from '..';

interface Props {
  address: string
  balances: BalancesInfo | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

const POLKAGATE_POOL_IDS = {
  Kusama: 18,
  Polkadot: 8,
  Westend: 6
};

const SAFETY_MARGIN_FACTOR_FOR_MIN_TO_SOLO_STAKE = 1.2;

export default function EasyMode ({ address, balances, inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chainName, decimal } = useInfo(address);
  const pool = usePool(address, POLKAGATE_POOL_IDS[chainName]);

  const poolConsts = usePoolConsts(address);
  const stakingConsts = useStakingConsts(address);
  const minToReceiveRewardsInSolo = useMinToReceiveRewardsInSolo2(address);
  const autoSelectedValidators = useValidatorSuggestion(address);

  const [amount, setAmount] = useState<string>(inputs?.extraInfo?.amount);
  const [isNextClicked, setNextIsClicked] = useState<boolean>();

  const buttonDisable = !amount;
  const isBusy = !inputs?.extraInfo?.amount && isNextClicked;

  useEffect(() => {
    if (amount && minToReceiveRewardsInSolo && poolConsts) {
      const amountAsBN = amountToMachine(amount, decimal);

      if (amountAsBN.gt(minToReceiveRewardsInSolo.muln(SAFETY_MARGIN_FACTOR_FOR_MIN_TO_SOLO_STAKE))) {
        // can stake solo
        if (api && autoSelectedValidators?.length) {
          const bonded = api.tx.staking.bond;
          const bondParams = [amountAsBN, 'Staked'];

          const nominated = api.tx.staking.nominate;
          const ids = autoSelectedValidators.map((v) => v.accountId);

          const call = api.tx.utility.batchAll;
          const params = [[bonded(...bondParams), nominated(ids)]];

          const extraInfo = {
            action: 'Solo Staking',
            amount,
            subAction: 'Stake'
          };

          setInputs({
            call,
            extraInfo,
            mode: STEPS.EASY_STAKING,
            params,
            selectedValidators: autoSelectedValidators
          });
        }
      } else if (amountAsBN.gte(poolConsts.minJoinBond)) {
        // can join the pool
        if (pool && api) {
          const call = api.tx.nominationPools.join;
          const params = [amountAsBN, pool.poolId];

          const extraInfo = {
            action: 'Pool Staking',
            amount,
            poolName: pool.metadata,
            subAction: 'Join'
          };

          pool && setInputs({
            call,
            extraInfo,
            mode: STEPS.EASY_STAKING,
            params,
            pool
          });
        }
      } else {
        console.log('cant stake!');
      }
    }
  }, [amount, api, autoSelectedValidators, decimal, minToReceiveRewardsInSolo, pool, poolConsts, setInputs]);

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
  }, [balances, setInputs]);

  const thresholds = useMemo(() => {
    if (!stakingConsts || !decimal || !balances || !poolConsts) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;
    let max = balances.freeBalance.sub(ED.muln(2));
    let min = poolConsts.minJoinBond;

    if (min.gt(max)) {
      min = max = BN_ZERO;
    }

    return { max, min };
  }, [balances, decimal, poolConsts, stakingConsts]);

  const onThresholdAmount = useCallback((maxMin: 'max' | 'min') => {
    if (!thresholds || !decimal) {
      return;
    }

    setInputs(undefined);

    setAmount(amountToHuman(thresholds[maxMin].toString(), decimal));
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

  return (
    <Grid container item>
      <Typography fontSize='16px' fontWeight={500} pb='15px' width='100%'>
        {t('Start your staking journey here! Stake your tokens to earn rewards while actively contributing to the security and integrity of the blockchain.')}
      </Typography>
      <Grid alignItems='center' container item justifyContent='flex-start' pt='20px'>
        <AmountWithOptions
          label={t('How much are you looking to stake?') }
          labelFontSize='16px'
          onChangeAmount={onChangeAmount}
          onPrimary={onMaxClick}
          onSecondary={onMinClick}
          primaryBtnText={t('Max amount')}
          secondaryBtnText={ t('Min amount')}
          style={{
            fontSize: '16px',
            mt: '15px',
            width: '73%'
          }}
          textSpace='15px'
          value={amount}
        />
        <Grid container item pb='10px'>
          <Grid container item justifyContent='space-between' sx={{ mt: '10px', width: '58.25%' }}>
            <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
              {t('Available Balance')}
            </Grid>
            <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
              <ShowBalance balance={balances?.availableBalance} decimal={decimal} decimalPoint={2} token={balances?.token} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px', width: '58.25%' }}>
            <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
              {t('Minimum to earn rewards')}
            </Grid>
            <Grid item sx={{ fontSize: '16px', fontWeight: 500 }}>
              <ShowBalance balance={poolConsts?.minJoinBond} decimal={decimal} decimalPoint={2} token={balances?.token} />
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
