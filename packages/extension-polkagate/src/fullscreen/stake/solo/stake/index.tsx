// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import { ValidatorInfo } from 'extension-polkagate/src/util/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Balance } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Infotip2, ShowBalance, TwoButtons } from '../../../../components';
import { useTranslation } from '../../../../components/translate';
import { useBalances, useInfo, useMinToReceiveRewardsInSolo2, useStakingAccount, useStakingConsts } from '../../../../hooks';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import { STEPS } from '../..';
import { Inputs } from '../../Entry';
import SelectValidators from '../partials/SelectValidators';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
  inputs: Inputs | undefined;
}

export default function SoloStake ({ inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const stakingAccount = useStakingAccount(address);

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const { api, decimal, formatted } = useInfo(address);

  const stakingConsts = useStakingConsts(address);
  const minToReceiveRewardsInSolo = useMinToReceiveRewardsInSolo2(address);

  const [amount, setAmount] = useState<string>(inputs?.amount);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [isNextClicked, setNextIsClicked] = useState<boolean>();

  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>([]);

  const { call, params } = useMemo(() => {
    if (amount && api && newSelectedValidators) {
      const amountAsBN = amountToMachine(amount, decimal);

      const bonded = api.tx.staking.bond;
      const bondParams = [amountAsBN, 'Staked'];

      const nominated = api.tx.staking.nominate;
      const ids = newSelectedValidators.map((v) => v.accountId);
      const call = api.tx.utility.batchAll;
      const params = [[bonded(...bondParams), nominated(ids)]];

      return { call, params };
    }

    return { call: undefined, params: undefined };
  }, [amount, api, decimal, newSelectedValidators]);

  const buttonDisable = useMemo(() => !amount || !newSelectedValidators?.length, [amount, newSelectedValidators?.length]);
  const isBusy = useMemo(() => (!inputs?.estimatedFee || !inputs?.amount) && isNextClicked, [inputs?.amount, inputs?.estimatedFee, isNextClicked]);

  useEffect(() => {
    if (call && params && newSelectedValidators) {
      const extraInfo = {
        action: 'Solo Staking',
        amount,
        fee: String(estimatedFee || 0),
        subAction: 'Stake'
      };

      setInputs({
        call,
        estimatedFee,
        extraInfo,
        mode: STEPS.STAKE_SOLO,
        params,
        selectedValidators: newSelectedValidators
      });
    } else {
      console.log('cant stake!');
    }
  }, [amount, call, estimatedFee, newSelectedValidators, params, setInputs]);

  useEffect(() => {
    if (call && params && formatted) {
      call(...params)
        .paymentInfo(formatted)
        .then((i) => setEstimatedFee(i?.partialFee))
        .catch(console.error);
    }
  }, [formatted, params, call]);

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
    if (!stakingConsts || !decimal || !balances || !minToReceiveRewardsInSolo) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;
    let max = balances.freeBalance.sub(ED.muln(2));
    let min = minToReceiveRewardsInSolo.add(ED); // we have added ED just to have a kind of safety margin

    if (min.gt(max)) {
      min = max = BN_ZERO;
    }

    return { max, min };
  }, [balances, decimal, minToReceiveRewardsInSolo, stakingConsts]);

  const onThresholdAmount = useCallback((maxMin: 'max' | 'min') => {
    if (!thresholds || !decimal) {
      return;
    }

    setAmount(amountToHuman(thresholds[maxMin].toString(), decimal));
  }, [thresholds, decimal]);

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
    () => setStep(STEPS.SOLO_REVIEW)
    , [setStep]);

  const onBackClick = useCallback(
    () => setStep(STEPS.INDEX)
    , [setStep]);

  useEffect(() => {
    isNextClicked && !isBusy && goToReview();
  }, [goToReview, isBusy, isNextClicked]);

  return (
    <>
      <Typography fontSize='16px' fontWeight={500} pb='15px' width='100%'>
        {t('Stake your tokens to support your selected validators. You earn a share of rewards received by your active validator(s) in each era.')}
      </Typography>
      <Grid alignItems='center' container item justifyContent='flex-start'>
        <AmountWithOptions
          label={t('Amount') }
          onChangeAmount={onChangeAmount}
          onPrimary={onMaxClick}
          onSecondary={onMinClick}
          primaryBtnText={t('Max amount')}
          secondaryBtnText={ t('Min amount')}
          style={{
            fontSize: '16px',
            mt: '10px',
            width: '73%'
          }}
          textSpace='15px'
          value={amount}
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
              <Infotip2 showQuestionMark text={t('This represents a dynamically adjusted minimum threshold to qualify for rewards per era. It may fluctuate based on the total stake of other stakers and the number of stakers present.')}>
                {t('Minimum to earn rewards')}
              </Infotip2>
            </Grid>
            <Grid item sx={{ fontSize: '14px', fontWeight: 500 }}>
              <ShowBalance balance={minToReceiveRewardsInSolo} decimal={decimal} decimalPoint={2} token={balances?.token} />
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ fontSize: '16px', fontWeight: 500, mt: '20px', width: '100%' }}>
          {t('Select Validators')}
        </Divider>
        <Grid container item justifyContent='flex-start' mt='10px'>
          <SelectValidators
            address={address}
            newSelectedValidators={newSelectedValidators}
            setNewSelectedValidators={setNewSelectedValidators}
            staked={stakingAccount?.stakingLedger?.active ?? BN_ZERO}
            stakingConsts={stakingConsts}
            stashId={formatted}
          />
          <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
            <TwoButtons
              disabled={buttonDisable}
              isBusy={isBusy}
              mt='1px'
              onPrimaryClick={onNextClick}
              onSecondaryClick={onBackClick}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Back')}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
