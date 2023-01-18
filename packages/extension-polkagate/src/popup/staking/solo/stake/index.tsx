// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, SoloSettings, StakingConsts, ValidatorInfo } from '../../../../util/types';

import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useApi, useBalances, useChain, useDecimal, useFormatted, useStakingAccount, useStakingConsts, useToken, useTranslation, useValidatorSuggestion } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import Asset from '../../../send/partial/Asset';
import SelectValidators from '../../partial/SelectValidators';
import Review from './Review';
import Settings from './Settings';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  stakingConsts: StakingConsts | undefined;
  stakingAccount: AccountStakingInfo | undefined
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const token = useToken(address);
  const decimal = useDecimal(address);
  const history = useHistory();
  const api = useApi(address, state?.api);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const balances = useBalances(address);
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const autoSelected = useValidatorSuggestion(address);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [settings, setSettings] = useState<SoloSettings>({ controllerId: formatted, payee: 'Staked', stashId: formatted });
  const [showAdvanceSettings, setShowAdvanceSettings] = useState<boolean>();
  const [validatorSelectionMethod, setValidatorSelectionMethod] = useState<'auto' | 'manual'>('auto');
  const [showSelectValidator, setShowSelectValidator] = useState<boolean>(false);

  const [manualSelectedValidators, setManualSelectedValidators] = useState<ValidatorInfo[]>([]);

  useEffect(() => {
    setSettings({ controllerId: formatted, payee: 'Staked', stashId: formatted });
  }, [formatted]);

  // const VALIDATOR_SELECTION_OPTIONS = [{ text: t('Auto'), value: 1 }, { text: t('Manual'), value: 2 }];
  const staked = useMemo(() => stakingAccount ? stakingAccount.stakingLedger.active : BN_ZERO, [stakingAccount]);
  const totalAfterStake = useMemo(() => decimal ? staked?.add(amountToMachine(amount, decimal)) : BN_ZERO, [amount, decimal, staked]);
  const isFirstTimeStaking = !!stakingAccount?.stakingLedger?.total?.isZero();

  const thresholds = useMemo(() => {
    if (!stakingConsts || !decimal || !balances || !stakingAccount) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;
    let max = balances.availableBalance.sub(ED.muln(2));
    let min = stakingConsts.minNominatorBond;

    if (!stakingAccount.stakingLedger.active.isZero()) {
      min = BN_ZERO;
    }

    if (min.gt(max)) {
      min = max = BN_ZERO;
    }

    return { max, min };
  }, [balances, decimal, stakingAccount, stakingConsts]);

  const bond = api && api.tx.staking.bond;// (controller: MultiAddress, value: Compact<u128>, payee: PalletStakingRewardDestination)
  const bondExtra = api && api.tx.staking.bondExtra;// (max_additional: Compact<u128>)
  const batchAll = api && api.tx.utility.batchAll;
  const nominated = api && api.tx.staking.nominate;

  const tx = isFirstTimeStaking ? bond : bondExtra;
  const amountAsBN = useMemo(() => amountToMachine(amount ?? '0', decimal), [amount, decimal]);
  const params = useMemo(() => stakingAccount?.stakingLedger?.total?.isZero() ? [settings.stashId, amountAsBN, settings.payee] : [amountAsBN], [amountAsBN, settings.payee, settings.stashId, stakingAccount?.stakingLedger?.total]);
  /** Staking is the default payee,can be changed in the advanced section **/
  /** payee:
   * Staked - Pay into the stash account, increasing the amount at stake accordingly.
   * Stash - Pay into the stash account, not increasing the amount at stake.
   * Account - Pay into a custom account. {Account: 17xyz....abc}
   * Controller - Pay into the controller account.
   */

  useEffect(() => {
    if (!tx || !api || !formatted || !nominated || !batchAll) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      setEstimatedFee(api.createType('Balance', BN_ONE));

      return;
    }

    if (isFirstTimeStaking && autoSelected?.length) {
      const ids = autoSelected.map((v) => v.accountId);

      batchAll([tx(...params), nominated(ids)]).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);

      return;
    }

    tx(...params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [amountAsBN, api, autoSelected, batchAll, bond, formatted, isFirstTimeStaking, nominated, params, tx]);

  useEffect(() => {
    if (!amountAsBN || !amount) {
      return;
    }

    if (amountAsBN.gt(balances?.availableBalance ?? BN_ZERO)) {
      return setAlert(t('It is more than available balance.'));
    }

    if (api && stakingConsts?.minNominatorBond && isFirstTimeStaking && (stakingConsts.minNominatorBond.gt(amountAsBN) || balances?.availableBalance?.lt(stakingConsts.minNominatorBond))) {
      const minNominatorBond = api.createType('Balance', stakingConsts.minNominatorBond).toHuman();

      return setAlert(t('The minimum to be a staker is: {{minNominatorBond}}', { replace: { minNominatorBond } }));
    }

    setAlert(undefined);
  }, [api, balances?.availableBalance, t, amountAsBN, stakingConsts?.minNominatorBond, isFirstTimeStaking, amount]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}/`,
      state: { ...state }
    });
  }, [address, history, state]);

  const onChangeAmount = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onThresholdAmount = useCallback((maxMin: 'max' | 'min') => {
    if (!thresholds || !decimal) {
      return;
    }

    setAmount(amountToHuman(thresholds[maxMin].toString(), decimal));
  }, [thresholds, decimal]);

  const goToNext = useCallback(() => {
    if (validatorSelectionMethod === 'auto') {
      setShowReview(true);
      setShowSelectValidator(false);

      return;
    }

    if (validatorSelectionMethod === 'manual') {
      setShowSelectValidator(true);
      setShowReview(false);
    }
  }, [validatorSelectionMethod]);

  const onSelectionMethodChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    console.log('value:', event.target.value);
    setValidatorSelectionMethod(event.target.value);
  }, []);

  const Warn = ({ text }: { text: string }) => (
    <Grid color='red' container justifyContent='center' py='15px'>
      <Warning
        fontWeight={400}
        isBelowInput
        isDanger
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
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Solo Staking')}
      />
      <SubTitle
        label={t('Stake')}
        withSteps={{ current: 1, total: 2 }}
      />
      <Grid item sx={{ mx: '15px' }} xs={12}>
        <Asset
          address={address}
          api={api}
          balance={balances?.availableBalance}
          balanceLabel={t('Available balance')}
          fee={estimatedFee}
          genesisHash={chain?.genesisHash}
          style={{ pt: '20px' }}
        />
        <div style={{ paddingTop: '30px' }}>
          <AmountWithOptions
            label={t<string>('Amount ({{token}})', { replace: { token } })}
            onChangeAmount={onChangeAmount}
            onPrimary={() => onThresholdAmount('max')}
            onSecondary={() => onThresholdAmount('min')}
            primaryBtnText={t<string>('Max amount')}
            secondaryBtnText={isFirstTimeStaking ? t<string>('Min amount') : undefined}
            value={amount}
          />
          {alert &&
            <Warn text={alert} />
          }
        </div>
        {isFirstTimeStaking &&
          <Grid container item justifyContent='flex-start' mt='30px' xs={12}>
            <FormControl>
              <FormLabel sx={{ color: 'text.primary', '&.Mui-focused': { color: 'text.primary' } }}>
                {t('Validator selection method')}
              </FormLabel>
              <RadioGroup defaultValue='auto' onChange={onSelectionMethodChange}>
                <FormControlLabel control={<Radio size='small' sx={{ color: 'secondary.main' }} value='auto' />} label={<Typography sx={{ fontSize: '18px' }}>{t('Auto')}</Typography>} />
                <FormControlLabel control={<Radio size='small' sx={{ color: 'secondary.main', py: '2px' }} value='manual' />} label={<Typography sx={{ fontSize: '18px' }}>{t('Manual')}</Typography>} />
              </RadioGroup>
            </FormControl>
            <Grid item onClick={() => setShowAdvanceSettings(true)} sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline', mt: '30px' }} xs={12}>
              {t('Advanced settings')}
            </Grid>
          </Grid>
        }
      </Grid>
      <PButton
        _isBusy={isFirstTimeStaking && showReview && !autoSelected}
        _onClick={goToNext}
        disabled={!!alert || !amount || amount === '0' || !balances?.availableBalance || balances?.availableBalance?.isZero() || balances?.availableBalance?.lte(estimatedFee?.addn(Number(amount) || 0) || BN_ZERO)}
        text={t<string>('Next')}
      />
      {showReview && amount && api && formatted && staked && chain && tx && params && (isFirstTimeStaking && validatorSelectionMethod === 'auto' ? autoSelected : true) &&
        <Review
          address={address}
          amount={amount}
          api={api}
          chain={chain}
          estimatedFee={estimatedFee}
          isFirstTimeStaking={isFirstTimeStaking}
          params={params}
          selectedValidators={validatorSelectionMethod === 'auto' ? autoSelected : manualSelectedValidators}
          setShow={setShowReview}
          settings={settings}
          show={showReview}
          total={totalAfterStake}
          tx={tx}
        />
      }
      {showAdvanceSettings &&
        <Grid item>
          <Settings
            address={address}
            setSettings={setSettings}
            setShowAdvanceSettings={setShowAdvanceSettings}
            settings={settings}
            showAdvanceSettings={showAdvanceSettings}
            stakingConsts={stakingConsts}
          />
        </Grid>
      }
      {validatorSelectionMethod === 'manual' && showSelectValidator && formatted &&
        <SelectValidators
          address={address}
          api={api}
          chain={chain}
          newSelectedValidators={manualSelectedValidators}
          setNewSelectedValidators={setManualSelectedValidators}
          setShow={setShowSelectValidator}
          setShowReview={setShowReview}
          show={showSelectValidator}
          staked={stakingAccount?.stakingLedger?.active ?? BN_ZERO}
          stakingConsts={stakingConsts}
          stashId={formatted}
          title={t('Select Validators')}

        />
      }
    </Motion>
  );
}
