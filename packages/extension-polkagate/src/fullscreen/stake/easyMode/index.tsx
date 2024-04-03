// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Balance } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, ShowBalance, TwoButtons } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useInfo, useMinToReceiveRewardsInSolo2, usePool, usePoolConsts, useStakingConsts, useValidatorSuggestion } from '../../../hooks';
import { BalancesInfo } from '../../../util/types';
import { amountToHuman, amountToMachine } from '../../../util/utils';
import { openOrFocusTab } from '../../accountDetailsFullScreen/components/CommonTasks';
import { Inputs, STEPS } from '..';

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

export default function InputPage ({ address, balances, inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chainName, decimal, formatted } = useInfo(address);
  const pool = usePool(address, POLKAGATE_POOL_IDS[chainName]);

  const poolConsts = usePoolConsts(address);
  const stakingConsts = useStakingConsts(address);
  const minToReceiveRewardsInSolo = useMinToReceiveRewardsInSolo2(address);
  const autoSelectedValidators = useValidatorSuggestion(address);

  const [amount, setAmount] = useState<string>(inputs?.amount);
  const [stakingMode, setStakingMode] = useState<'easy' | 'advanced'>('easy');
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [isNextClicked, setNextIsClicked] = useState<boolean>();

  const buttonDisable = !amount;
  const isBusy = (!inputs?.estimatedFee || !inputs?.amount) && isNextClicked;

  useEffect(() => {
    if (stakingMode === 'easy' && amount && minToReceiveRewardsInSolo && poolConsts) {
      const amountAsBN = amountToMachine(amount, decimal);

      if (amountAsBN.gt(minToReceiveRewardsInSolo.muln(SAFETY_MARGIN_FACTOR_FOR_MIN_TO_SOLO_STAKE))) {
        // can stake solo
        if (api && autoSelectedValidators) {
          const bonded = api.tx.staking.bond;
          const bondParams = [amountAsBN, 'Staked'];

          const nominated = api.tx.staking.nominate;
          const ids = autoSelectedValidators.map((v) => v.accountId);

          const call = api.tx.utility.batchAll;
          const params = [[bonded(...bondParams), nominated(ids)]];

          const extraInfo = {
            action: 'Solo Staking',
            amount,
            fee: String(estimatedFee || 0),
            subAction: 'Stake'
          };

          setInputs({
            amount,
            call,
            estimatedFee,
            extraInfo,
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
            fee: String(estimatedFee || 0),
            poolName: pool.metadata,
            subAction: 'Join'
          };

          pool && setInputs({
            amount,
            call,
            estimatedFee,
            extraInfo,
            params,
            pool
          });
        }
      } else {
        console.log('cant stake!');
      }
    }
  }, [amount, api, autoSelectedValidators, decimal, estimatedFee, minToReceiveRewardsInSolo, pool, poolConsts, setInputs, stakingMode]);

  useEffect(() => {
    if (inputs?.call && inputs?.params && formatted) {
      inputs.call(...inputs.params)
        .paymentInfo(formatted)
        .then((i) => setEstimatedFee(i?.partialFee))
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted, inputs?.params, inputs?.call]);

  const onChangeAmount = useCallback((value: string) => {
    if (!balances) {
      return;
    }

    if (value.length > balances.decimal - 1) {
      console.log(`The amount digits is more than decimal:${balances.decimal}`);

      return;
    }

    setAmount(value);
  }, [balances]);

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

    setInputs({ ...(inputs || {}), amount: undefined });
    setAmount(amountToHuman(thresholds[maxMin].toString(), decimal));
  }, [thresholds, decimal, setInputs, inputs]);

  const onSelectionMethodChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setStakingMode(event.target.value);
  }, []);

  const onMaxClick = useCallback(
    () => onThresholdAmount('max')
    , [onThresholdAmount]);

  const onMinClick = useCallback(
    () => onThresholdAmount('min')
    , [onThresholdAmount]);

  const onNextClick = useCallback(() => {
    if (stakingMode === 'easy') {
      setNextIsClicked(true);
    } else {
      setStep(STEPS.STAKING_OPTIONS);
    }
  }, [setStep, stakingMode]);

  const goToReview = useCallback(
    () => setStep(STEPS.EASY_REVIEW)
    , [setStep]);

  const backToDetail = useCallback(
    () => address && openOrFocusTab(`/accountfs/${address}/0`, true)
    , [address]);

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
          label={t('Amount') }
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
          value={amount || inputs?.amount}
        />
        <Grid container item pb='10px'>
          <Grid container item justifyContent='space-between' sx={{ mt: '10px', width: '58.25%' }}>
            <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
              {t('Available Balance')}
            </Grid>
            <Grid item sx={{ fontSize: '14px', fontWeight: 500 }}>
              <ShowBalance balance={balances?.availableBalance} decimal={decimal} decimalPoint={2} token={balances?.token} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px', width: '58.25%' }}>
            <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
              {t('Minimum to earn rewards')}
            </Grid>
            <Grid item sx={{ fontSize: '14px', fontWeight: 500 }}>
              <ShowBalance balance={poolConsts?.minJoinBond} decimal={decimal} decimalPoint={2} token={balances?.token} />
            </Grid>
          </Grid>
        </Grid>
        <Grid container item justifyContent='flex-start' mt='30px' xs={12}>
          <FormControl>
            <FormLabel sx={{ '&.Mui-focused': { color: 'text.primary' }, color: 'text.primary' }}>
              {t('Select your preferred staking option')}
            </FormLabel>
            <RadioGroup defaultValue={stakingMode} onChange={onSelectionMethodChange}>
              <FormControlLabel
                control={
                  <Radio size='small' sx={{ color: 'secondary.main', pt: '15px' }} value='easy' />
                }
                label={
                  <Typography sx={{ fontSize: '17px' }}>
                    {t('Easy (Automated processes for simplicity)')}
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Radio size='small' sx={{ color: 'secondary.main', pt: '10px' }} value='advanced' />
                }
                label={
                  <Typography sx={{ fontSize: '17px' }}>
                    {t('Advanced (Manual control for experienced users)')}
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
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
