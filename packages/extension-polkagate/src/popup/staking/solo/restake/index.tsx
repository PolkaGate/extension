// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useEstimatedFee, useInfo, useStakingAccount, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import Asset from '../../../../partials/Asset';
import { MAX_AMOUNT_LENGTH, STAKING_CHAINS } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import Review from './Review';

// interface State {
//   api: ApiPromise | undefined;
//   pathname: string;
//   stakingConsts: StakingConsts | undefined;
//   stakingAccount: AccountStakingInfo | undefined;
//   unlockingAmount: BN | undefined;
// }

export default function Index (): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const { api, chain, decimal, formatted, token } = useInfo(address);
  const navigate = useNavigate();

  useUnSupportedNetwork(address, STAKING_CHAINS);
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);

  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [restakeAllAmount, setRestakeAllAmount] = useState<boolean>(false);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>(state?.unlockingAmount);

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active as BN | undefined, [stakingAccount?.stakingLedger?.active]);
  const amountAsBN = useMemo(() => amountToMachine(amount, decimal), [amount, decimal]);
  const totalStakeAfter = useMemo(() => staked && unlockingAmount && staked.add(amountAsBN), [amountAsBN, staked, unlockingAmount]);

  const rebonded = api?.tx['staking']['rebond'];

  const estimatedFee = useEstimatedFee(address, rebonded, [amountAsBN]);

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    let unlockingValue = BN_ZERO;

    if (stakingAccount?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as unknown as string);

          unlockingValue = unlockingValue.add(amount);
        }
      }
    }

    setUnlockingAmount(unlockingValue);
  }, [stakingAccount]);

  useEffect(() => {
    if (amountAsBN.gt(unlockingAmount || BN_ZERO)) {
      return setAlert(t('It is more than total unlocking amount.'));
    }

    setAlert(undefined);
  }, [unlockingAmount, t, amountAsBN]);

  const onBackClick = useCallback(() => {
    navigate(`/solo/${address}`, { state: { ...state } });
  }, [address, navigate, state]);

  const onChangeAmount = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

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

  return (
    <Motion>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t('Solo Restaking')}
      />
      <SubTitle
        label={t('Restake')}
        withSteps={{ current: 1, total: 2 }}
      />
      <Grid item sx={{ mx: '15px' }} xs={12}>
        <Asset
          address={address}
          api={api}
          balance={unlockingAmount}
          balanceLabel={t('Unstaking')}
          fee={estimatedFee}
          style={{ pt: '20px' }}
        />
        <div style={{ paddingTop: '30px' }}>
          <AmountWithOptions
            label={t('Amount ({{token}})', { replace: { token } })}
            onChangeAmount={onChangeAmount}
            onPrimary={onAllAmount}
            primaryBtnText={t('All amount')}
            value={amount}
          />
          {alert &&
            <Warn text={alert} />
          }
        </div>
      </Grid>
      <PButton
        _onClick={goToReview}
        disabled={!amount || amount === '0' || unlockingAmount?.lt(amountAsBN)}
        text={t('Next')}
      />
      {showReview && amount && api && formatted && unlockingAmount && chain && decimal &&
        <Review
          address={address}
          amount={restakeAllAmount ? unlockingAmount : amountToMachine(amount, decimal)}
          api={api}
          chain={chain as any}
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
