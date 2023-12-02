// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useApi, useChain, useDecimal, useFormatted, useStakingAccount, useStakingConsts, useToken, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import Asset from '../../../../partials/Asset';
import { DATE_OPTIONS, MAX_AMOUNT_LENGTH, STAKING_CHAINS } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
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
  const token = useToken(address);
  const decimal = useDecimal(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [isUnstakeAll, setIsUnstakeAll] = useState<boolean>(false);

  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active as unknown as BN, [stakingAccount]);
  const totalAfterUnstake = useMemo(() => staked && decimal ? staked.sub(amountToMachine(amount, decimal)) : undefined, [amount, decimal, staked]);
  const unlockingLen = stakingAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;
  const amountAsBN = useMemo(() => amountToMachine(amount, decimal), [amount, decimal]);

  const unbonded = api && api.tx.staking.unbond; // signer: Controller
  const redeem = api && api.tx.staking.withdrawUnbonded; // signer: Controller
  const chilled = api && api.tx.staking.chill; // signer: Controller
  const redeemDate = useMemo(() => {
    if (stakingConsts) {
      const date = Date.now() + stakingConsts.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingConsts]);

  useEffect(() => {
    if (!amountAsBN) {
      return;
    }

    if (amountAsBN.gt(staked ?? BN_ZERO)) {
      return setAlert(t('It is more than already staked.'));
    }

    if (api && staked && stakingConsts && !staked.sub(amountAsBN).isZero() && !isUnstakeAll && staked.sub(amountAsBN).lt(stakingConsts.minNominatorBond)) {
      const remained = api.createType('Balance', staked.sub(amountAsBN)).toHuman();
      const min = api.createType('Balance', stakingConsts.minNominatorBond).toHuman();

      return setAlert(t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } }));
    }

    setAlert(undefined);
  }, [amountAsBN, api, staked, stakingConsts, t, isUnstakeAll]);

  const getFee = useCallback(async () => {
    const txs = [];

    if (api && !api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    if (redeem && chilled && unbonded && maxUnlockingChunks !== undefined && unlockingLen !== undefined && formatted && staked) {
      txs.push(unbonded(amountAsBN));

      if (unlockingLen >= maxUnlockingChunks) {
        const dummyParams = [100];

        txs.push(redeem(...dummyParams));
      }

      if (isUnstakeAll) {
        txs.push(chilled());
      }

      const finalTx = txs.length > 1 ? api.tx.utility.batchAll(txs) : txs[0];

      const partialFee = (await finalTx.paymentInfo(formatted))?.partialFee;

      setEstimatedFee(api?.createType('Balance', partialFee));
    }
  }, [amountAsBN, api, chilled, formatted, maxUnlockingChunks, redeem, staked, unbonded, unlockingLen, isUnstakeAll]);

  useEffect(() => {
    if (amountAsBN && redeem && chilled && maxUnlockingChunks && unlockingLen !== undefined && unbonded && formatted && staked) {
      getFee().catch(console.error);
    }
  }, [amountAsBN, api, chilled, formatted, getFee, maxUnlockingChunks, redeem, staked, unbonded, unlockingLen]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const onChangeAmount = useCallback((value: string) => {
    setIsUnstakeAll(false);

    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    const roundedAmount = value.slice(0, MAX_AMOUNT_LENGTH);

    setAmount(roundedAmount);
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!staked || !decimal) {
      return;
    }

    const allToShow = amountToHuman(staked.toString(), decimal);

    setIsUnstakeAll(true);
    setAmount(allToShow);
  }, [decimal, staked]);

  const goToReview = useCallback(() => {
    setShowReview(true);
  }, []);

  const Warn = ({ belowInput, iconDanger, isDanger, text }: { belowInput?: boolean, text: string, isDanger?: boolean, iconDanger?: boolean }) => (
    <Grid container sx={{ '> div': { mr: '0', mt: isDanger ? '15px' : 0, pl: '5px' }, justifyContent: isDanger ? 'center' : 'unset' }}>
      <Warning
        fontWeight={400}
        iconDanger={iconDanger}
        isBelowInput={belowInput}
        isDanger={isDanger}
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
        label={t('Unstake')}
        withSteps={{ current: 1, total: 2 }}
      />
      {staked?.isZero() &&
        <Warn isDanger text={t<string>('Nothing to unstake.')} />
      }
      <Grid item sx={{ mx: '15px' }} xs={12}>
        <Asset
          address={address}
          api={api}
          balance={staked}
          balanceLabel={t('Staked')}
          fee={estimatedFee}
          style={{ pt: '20px' }}
        />
        <div style={{ paddingTop: '30px' }}>
          <AmountWithOptions
            label={t<string>('Amount ({{token}})', { replace: { token } })}
            onChangeAmount={onChangeAmount}
            onPrimary={onAllAmount}
            primaryBtnText={t<string>('All amount')}
            value={amount}
          />
          {alert &&
            <Warn belowInput iconDanger text={alert} />
          }
        </div>

      </Grid>
      <PButton
        _onClick={goToReview}
        disabled={!amount || amount === '0'}
        text={t<string>('Next')}
      />
      {showReview && amount && api && formatted && maxUnlockingChunks && staked && chain &&
        <Review
          address={address}
          amount={amount}
          staked={staked}
          chilled={chilled}
          estimatedFee={estimatedFee}
          hasNominator={!!stakingAccount?.nominators?.length}
          isUnstakeAll={isUnstakeAll}
          maxUnlockingChunks={maxUnlockingChunks}
          redeem={redeem}
          redeemDate={redeemDate}
          setShow={setShowReview}
          show={showReview}
          total={totalAfterUnstake}
          unbonded={unbonded}
          unlockingLen={unlockingLen ?? 0}
        />
      }
    </Motion>
  );
}
