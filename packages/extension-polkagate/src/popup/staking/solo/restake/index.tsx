// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DATE_OPTIONS, DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import Asset from '../../../send/partial/Asset';
import Review from './Review';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  stakingConsts: StakingConsts | undefined;
  stakingAccount: AccountStakingInfo | undefined;
  unlockingAmount: BN | undefined;
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
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [restakeAllAmount, setRestakeAllAmount] = useState<boolean>(false);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);

  const decimal = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const token = api?.registry?.chainTokens[0] ?? '...';

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active?.unwrap(), [stakingAccount?.stakingLedger?.active]);
  const totalStakeAfter = useMemo(() => staked && unlockingAmount && staked.add(amountToMachine(amount, decimal)), [amount, decimal, staked, unlockingAmount]);

  const rebonded = api && api.tx.staking.rebond;

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    let unlockingValue = BN_ZERO;

    if (stakingAccount?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as string);

          unlockingValue = unlockingValue.add(amount);
        }
      }
    }

    setUnlockingAmount(unlockingValue);
  }, [stakingAccount]);


  useEffect(() => {
    if (!amount) {
      return;
    }

    const amountAsBN = amountToMachine(amount, decimal);

    if (amountAsBN.gt(unlockingAmount ?? BN_ZERO)) {
      return setAlert(t('It is more than total unlocking amount.'));
    }

    setAlert(undefined);
  }, [amount, api, decimal, unlockingAmount, stakingConsts, t, restakeAllAmount]);

  useEffect(() => {
    if (!rebonded) { return; }

    const amountAsBN = amountToMachine(amount ?? '0', decimal);

    rebonded(amountAsBN).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [amount, decimal, formatted, rebonded]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/',
      state: { ...state }
    });
  }, [history, state]);

  const onChangeAmount = useCallback((value: string) => {
    setRestakeAllAmount(false);

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!unlockingAmount) {
      return;
    }

    const allToShow = amountToHuman(unlockingAmount.toString(), decimal);

    setRestakeAllAmount(true);
    setAmount(allToShow);
  }, [decimal, unlockingAmount]);

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
        text={t<string>('Solo Restaking')}
      />
      <SubTitle
        label={t('Restake')}
        withSteps={{ current: 1, total: 2 }}
      />
      <Grid item xs={12} sx={{ mx: '15px' }}>
        <Asset api={api} balance={unlockingAmount} balanceLabel={t('Unlocking')} fee={estimatedFee} genesisHash={chain?.genesisHash} style={{ pt: '20px' }} />
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
      {showReview && amount && api && formatted && unlockingAmount && chain &&
        <Review
          address={address}
          amount={amount}
          api={api}
          chain={chain}
          estimatedFee={estimatedFee}
          formatted={formatted}
          rebonded={rebonded}
          setShow={setShowReview}
          show={showReview}
          total={totalStakeAfter}
          unlockingAmount={unlockingAmount}
        />
      }
    </Motion>
  );
}

