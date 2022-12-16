// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, SoloSettings, StakingConsts } from '../../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Select, Warning } from '../../../../components';
import { useApi, useBalances, useChain, useFormatted, useStakingAccount, useStakingConsts, useToken, useTranslation, useValidatorSuggestion } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, MAX_AMOUNT_LENGTH, MIN_EXTRA_BOND } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import Asset from '../../../send/partial/Asset';
import Review from './Review';

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

  useEffect(() => {
    setSettings({ controllerId: '5CEUsVeAEWNVwNoyuT7mwDnxumZP6GPaaGrRKW6fWm38PEgz', payee: 'Staked', stashId: formatted });
  }, [formatted]);

  console.log('autoSelected:', autoSelected);

  const VALIDATOR_SELECTION_OPTIONS = [{ text: t('Auto'), value: 1 }, { text: t('Manual'), value: 2 }];
  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active, [stakingAccount]);
  const decimal = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const totalAfterStake = useMemo(() => staked?.add(amountToMachine(amount, decimal)), [amount, decimal, staked]);
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
  /** Staking is the default payee,can be changed in the advanced section **/
  /** payee:
   * Staked - Pay into the stash account, increasing the amount at stake accordingly.
   * Stash - Pay into the stash account, not increasing the amount at stake.
   * Account - Pay into a custom account. {Account: 17xyz....abc}
   * Controller - Pay into the controller account.
   */

  const params = useMemo(() => stakingAccount?.stakingLedger?.total?.isZero() ? [settings.stashId, amountAsBN, settings.payee] : [amountAsBN], [amountAsBN, settings.payee, settings.stashId, stakingAccount?.stakingLedger?.total]);

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
    if (!amount) {
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
  }, [amount, api, decimal, balances?.availableBalance, t, amountAsBN, stakingConsts?.minNominatorBond, isFirstTimeStaking]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}/`,
      state: { ...state }
    });
  }, [address, history, state]);

  const onChangeAmount = useCallback((value: string) => {
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

  const goToReview = useCallback(() => {
    setShowReview(true);
  }, []);

  const onSelectionMethodChange = useCallback((value: string | number): void => {
console.log('value:', value)
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
        paddingBottom={0}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Solo Staking')}
      />
      <SubTitle
        label={t('Stake')}
        withSteps={{ current: 1, total: 2 }}
      />
      <Grid item xs={12} sx={{ mx: '15px' }}>
        <Asset
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
        <Grid item mt='20px' xs={12}>
          {isFirstTimeStaking &&
            <Select
              defaultValue={VALIDATOR_SELECTION_OPTIONS[0].value}
              label={'Validator selection method'}
              onChange={onSelectionMethodChange}
              options={VALIDATOR_SELECTION_OPTIONS}
            />
          }
        </Grid>
      </Grid>
      <PButton
        _isBusy={isFirstTimeStaking && showReview && !autoSelected}
        _onClick={goToReview}
        disabled={!!alert || !amount || amount === '0' || !balances?.availableBalance || balances?.availableBalance?.isZero() || balances?.availableBalance?.lte(estimatedFee?.addn(Number(amount) || 0) || BN_ZERO)}
        text={t<string>('Next')}
      />
      {showReview && amount && api && formatted && staked && chain && tx && params && (isFirstTimeStaking ? autoSelected : true) &&
        <Review
          address={address}
          amount={amount}
          api={api}
          chain={chain}
          estimatedFee={estimatedFee}
          isFirstTimeStaking={isFirstTimeStaking}
          params={params}
          selectedValidators={autoSelected}
          setShow={setShowReview}
          settings={settings}
          show={showReview}
          total={totalAfterStake}
          tx={tx}
        />
      }
    </Motion>
  );
}

