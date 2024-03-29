// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN_ZERO } from '@polkadot/util';

import { ActionContext, AmountWithOptions, ShowBalance, TwoButtons } from '../../components';
import { useBalances, useDecimal, useFullscreen, usePoolConsts, useStakingConsts, useToken, useTranslation } from '../../hooks';
import { amountToHuman } from '../../util/utils';
import { FullScreenHeader } from '../governance/FullScreenHeader';

function Stake (): React.ReactElement {
  useFullscreen();
  const onAction = useContext(ActionContext);
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const token = useToken(address);
  const decimal = useDecimal(address);

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh);
  const poolConsts = usePoolConsts(address);
  const stakingConsts = useStakingConsts(address);

  const [amount, setAmount] = useState<string>();
  const [stakinfMode, setStakingMode] = useState<'easy' | 'advanced'>();

  const buttonDisable = !amount;

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

    setAmount(amountToHuman(thresholds[maxMin].toString(), decimal));
  }, [thresholds, decimal]);

  const onSelectionMethodChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setStakingMode(event.target.value);
  }, []);

  const backToDetail = useCallback(
    () => onAction(`/accountfs/${address}/0`)
    , [address, onAction]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        page='stake'
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <FontAwesomeIcon
                color={theme.palette.text.primary}
                fontSize='50px'
                icon={faCoins}
              />            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Staking')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={500} pb='15px' pt='30px' width='100%'>
            {t<string>('Start your staking journey here! Stake your tokens to earn rewards while actively contributing to the security and integrity of the blockchain.')}
          </Typography>
          <Grid alignItems='center' container item justifyContent='flex-start' pt='40px'>
            <Grid item md={6.9} xs={12}>
              <Typography fontSize='16px'>
                {t<string>('Available balance')}
              </Typography>
              <Grid alignItems='center' container item sx={{ border: 1, borderColor: 'rgba(75, 75, 75, 0.3)', fontSize: '18px', height: '48px', p: '0 5px' }}>
                <ShowBalance balance={balances?.availableBalance} decimal={balances?.decimal} skeletonWidth={120} token={balances?.token} />
              </Grid>
            </Grid>
            <Grid item md={6.9} mt='40px' xs={12}>
              <Typography fontSize='16px'>
                {t<string>('How much would you like to stake?')}
              </Typography>
            </Grid>
            <AmountWithOptions
              label={t('Amount') }
              onChangeAmount={onChangeAmount}
              onPrimary={() => onThresholdAmount('max')}
              onSecondary={() => onThresholdAmount('min')}
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
            <Grid container item justifyContent='flex-start' mt='30px' xs={12}>
              <FormControl>
                <FormLabel sx={{ color: 'text.primary', '&.Mui-focused': { color: 'text.primary' } }}>
                  {t('Select your preferred staking option')}
                </FormLabel>
                <RadioGroup defaultValue='auto' onChange={onSelectionMethodChange}>
                  <FormControlLabel
                    control={
                      <Radio size='small' sx={{ color: 'secondary.main' }} value='auto' />
                    }
                    label={
                      <Typography sx={{ fontSize: '18px' }}>
                        {t('Easy')}
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Radio size='small' sx={{ color: 'secondary.main', py: '2px' }} value='manual' />
                    }
                    label={
                      <Typography sx={{ fontSize: '18px' }}>
                        {t('Advanced')}
                      </Typography>
                    }
                  />
                </RadioGroup>
              </FormControl>
              <Grid item xs={12}>
                <Divider
                  sx={{
                    bgcolor: 'transparent',
                    border: '0.5px solid rgba(99, 54, 77, 0.2) ',
                    mt: '40px',
                    width: '100%'
                  }}
                />
              </Grid>
              <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
                <TwoButtons
                  disabled={buttonDisable}
                  mt='1px'
                  // onPrimaryClick={() => setStep(STEPS.REVIEW)}
                  onSecondaryClick={backToDetail}
                  primaryBtnText={t<string>('Next')}
                  secondaryBtnText={t<string>('Back')}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(Stake);
