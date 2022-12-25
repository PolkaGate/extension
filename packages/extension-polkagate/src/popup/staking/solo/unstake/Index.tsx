// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, Motion, PButton, Warning } from '../../../../components';
import { useApi, useChain, useDecimal, useFormatted, useStakingAccount, useStakingConsts, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DATE_OPTIONS, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
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
  const token = useToken(address);
  const decimal = useDecimal(address);

  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [unstakeAllAmount, setUnstakeAllAmount] = useState<boolean>(false);

  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active, [stakingAccount]);
  const totalAfterUnstake = useMemo(() => staked && decimal && staked.sub(amountToMachine(amount, decimal)), [amount, decimal, staked]);
  const unlockingLen = stakingAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;

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
    if (!amount || !decimal) {
      return;
    }

    const amountAsBN = amountToMachine(amount, decimal);

    if (amountAsBN.gt(staked ?? BN_ZERO)) {
      return setAlert(t('It is more than already staked.'));
    }

    if (api && staked && stakingConsts && !staked.sub(amountAsBN).isZero() && !unstakeAllAmount && staked.sub(amountAsBN).lt(stakingConsts.minNominatorBond)) {
      const remained = api.createType('Balance', staked.sub(amountAsBN)).toHuman();
      const min = api.createType('Balance', stakingConsts.minNominatorBond).toHuman();

      return setAlert(t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } }));
    }

    setAlert(undefined);
  }, [amount, api, decimal, staked, stakingConsts, t, unstakeAllAmount]);

  const getFee = useCallback(async () => {
    const amountAsBN = amountToMachine(amount ?? '0', decimal);
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

      if (amountAsBN.eq(staked)) {
        txs.push(chilled());
      }

      const finalTx = txs.length > 1 ? api.tx.utility.batchAll(txs) : txs[0];

      const partialFee = (await finalTx.paymentInfo(formatted))?.partialFee;

      setEstimatedFee(api?.createType('Balance', partialFee));
    }
  }, [amount, api, chilled, decimal, formatted, maxUnlockingChunks, redeem, staked, unbonded, unlockingLen]);

  useEffect(() => {
    if (decimal && redeem && chilled && maxUnlockingChunks && unlockingLen !== undefined && unbonded && formatted && staked) {
      getFee().catch(console.error);
    }
  }, [amount, api, chilled, decimal, formatted, getFee, maxUnlockingChunks, redeem, staked, unbonded, unlockingLen]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const onChangeAmount = useCallback((value: string) => {
    setUnstakeAllAmount(false);

    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!staked || !decimal) {
      return;
    }

    const allToShow = amountToHuman(staked.toString(), decimal);

    setUnstakeAllAmount(true);
    setAmount(allToShow);
  }, [decimal, staked]);

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
        <Warn text={t<string>('Nothing to unstake.')} />
      }
      <Grid item xs={12} sx={{ mx: '15px' }}>
        <Asset
          address={address}
          api={api}
          balance={staked}
          balanceLabel={t('Staked')}
          fee={estimatedFee}
          genesisHash={chain?.genesisHash}
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
            <Warn text={alert} />
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
          api={api}
          chain={chain}
          chilled={chilled}
          estimatedFee={estimatedFee}
          formatted={formatted}
          hasNominator={!!stakingAccount?.nominators?.length}
          maxUnlockingChunks={maxUnlockingChunks}
          redeem={redeem}
          redeemDate={redeemDate}
          setShow={setShowReview}
          show={showReview}
          staked={staked}
          total={totalAfterUnstake}
          unbonded={unbonded}
          unlockingLen={unlockingLen ?? 0}
        />
      }
    </Motion>
  );
}

