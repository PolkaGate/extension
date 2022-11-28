// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useApi, useBalances, useChain, useFormatted, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
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
  const history = useHistory();
  const api = useApi(address, state?.api);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const balances = useBalances(address);
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [stakeAllAmount, setStakeAllAmount] = useState<boolean>(false);

  console.log('balances:', balances)
  console.log('stakingAccount:', stakingAccount)
  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active.unwrap(), [stakingAccount]);
  const decimal = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const token = api?.registry?.chainTokens[0] ?? '...';
  const totalAfterStake = useMemo(() => staked && staked.add(amountToMachine(amount, decimal)), [amount, decimal, staked]);

  const bond = api && api.tx.staking.bond;// (controller: MultiAddress, value: Compact<u128>, payee: PalletStakingRewardDestination)
  const bondExtra = api && api.tx.staking.bondExtra;//(max_additional: Compact<u128>)
  const tx = stakingAccount?.stakingLedger?.active ? bondExtra : bond;
  const amountAsBN = useMemo(() => amountToMachine(amount ?? '0', decimal), [amount, decimal]);
  const payee = 'Staked';
  /** Staking is the default payee,can be changed in the advanced section **/
  /** payee:
   * Staked - Pay into the stash account, increasing the amount at stake accordingly.
   * Stash - Pay into the stash account, not increasing the amount at stake.
   * Account - Pay into a custom account.
   * Controller - Pay into the controller account.
   */

  const params = useMemo(() => stakingAccount?.stakingLedger?.active ? [amountAsBN] : [formatted, amountAsBN, payee], [amountAsBN, formatted, stakingAccount?.stakingLedger?.active]);

  useEffect(() => {
    if (!tx || !api || !formatted) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api.createType('Balance', BN_ONE));
    }

    tx(...params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [amountAsBN, api, bond, formatted, params, tx]);

  useEffect(() => {
    if (!amount) {
      return;
    }

    if (amountAsBN.gt(balances?.availableBalance ?? BN_ZERO)) {
      return setAlert(t('It is more than available balance.'));
    }

    setAlert(undefined);
  }, [amount, api, decimal, balances?.availableBalance, t, amountAsBN]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/',
      state: { ...state }
    });
  }, [history, state]);

  const onChangeAmount = useCallback((value: string) => {
    setStakeAllAmount(false);

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!balances?.availableBalance) {
      return;
    }

    const allToShow = amountToHuman(balances.availableBalance.toString(), decimal);

    setStakeAllAmount(true);
    setAmount(allToShow);
  }, [decimal, balances?.availableBalance]);

  const goToReview = useCallback(() => {
    setShowReview(true);
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
        <Asset api={api} balance={balances?.availableBalance} balanceLabel={t('Available balance')} fee={estimatedFee} genesisHash={chain?.genesisHash} style={{ pt: '20px' }} />
        <div style={{ paddingTop: '30px' }}>
          <AmountWithOptions
            label={t<string>('Amount ({{token}})', { replace: { token } })}
            onChangeAmount={onChangeAmount}
            onPrimary={onAllAmount}
            primaryBtnText={t<string>('All amount')}
            value={amount}
          />
          {alert &&
            <Warn text={alert} />
          }
        </div>

      </Grid>
      <PButton
        _onClick={goToReview}
        disabled={!amount || amount === '0'}
        text={t<string>('Next')}
      />
      {showReview && amount && api && formatted && staked && chain && tx && params &&
        <Review
          address={address}
          amount={amount}
          api={api}
          chain={chain}
          estimatedFee={estimatedFee}
          formatted={formatted}
          params={params}
          setShow={setShowReview}
          show={showReview}
          staked={staked}
          total={totalAfterStake}
          tx={tx}
        />
      }
    </Motion>
  );
}

