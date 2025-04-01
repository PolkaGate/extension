// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import CheckCircleOutlineSharpIcon from '@mui/icons-material/CheckCircleOutlineSharp';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { Motion, PButton, Progress, Warning } from '../../../../components';
import { useBalances, useEstimatedFee, useInfo, useIsExposed, useStakingAccount, useStakingConsts, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { STAKING_CHAINS } from '../../../../util/constants';
import { amountToHuman } from '../../../../util/utils';
import { getValue } from '../../../account/util';
import FastUnstakeReview from './Review';

interface State {
  api: ApiPromise | undefined;
  pathname: string;
  stakingConsts: StakingConsts | undefined;
  stakingAccount: AccountStakingInfo | undefined
}

export default function Index (): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const { api, chain, decimal, formatted, token } = useInfo(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const myBalances = useBalances(address);
  const maybeMyStashBalances = useBalances(stakingAccount?.stashId as unknown as string);

  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const isExposed = useIsExposed(address);

  const fastUnstakeDeposit = api ? api.consts['fastUnstake']['deposit'] as unknown as BN : undefined;
  const balances = useMemo(() => maybeMyStashBalances || myBalances, [maybeMyStashBalances, myBalances]);
  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);
  const transferableBalance = useMemo(() => getValue('transferable', balances), [balances]);

  const [showFastUnstakeReview, setShowReview] = useState<boolean>(false);

  const staked = useMemo((): BN | undefined => stakingAccount ? stakingAccount.stakingLedger.active as unknown as BN : undefined, [stakingAccount]);
  const tx = api?.tx['fastUnstake']['registerFastUnstake'];

  const estimatedFee = useEstimatedFee(address, tx?.());
  const hasEnoughDeposit = fastUnstakeDeposit && stakingConsts && myBalances && estimatedFee && getValue('available', myBalances)
    ? new BN(fastUnstakeDeposit).add(estimatedFee).lt(getValue('available', myBalances) || BN_ZERO)
    : undefined;
  const hasUnlockingAndRedeemable = redeemable && stakingAccount
    ? !!(!redeemable.isZero() || stakingAccount.unlocking?.length)
    : undefined;

  const isEligible = isExposed !== undefined && hasUnlockingAndRedeemable !== undefined && hasEnoughDeposit !== undefined
    ? !isExposed && !hasUnlockingAndRedeemable && hasEnoughDeposit
    : undefined;

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const goTo = useCallback(() => {
    isEligible === true && setShowReview(true);
    isEligible === false && onBackClick();
  }, [isEligible, onBackClick]);

  const NumberPassFail = ({ condition, no }: { condition: boolean | undefined, no: number }) => (
    condition
      ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
      : <Typography fontSize='13px' sx={{ bgcolor: condition === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', color: 'white', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
        {no}
      </Typography>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t('Solo Staking')}
      />
      <SubTitle
        label={t('Fast Unstake')}
        withSteps={{ current: 1, total: 2 }}
      />
      <Grid container direction='column' m='20px auto' width='90%'>
        <Typography fontSize='14px' fontWeight={300}>
          {t('Checking fast unstake eligibility')}:
        </Typography>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px' pt='15px'>
          <NumberPassFail condition={hasEnoughDeposit} no={1} />
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t('Having {{deposit}} {{token}} available to deposit', { replace: { deposit: fastUnstakeDeposit && decimal ? amountToHuman(fastUnstakeDeposit, decimal) : '...', token } })}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          <NumberPassFail condition={hasUnlockingAndRedeemable === undefined ? undefined : hasUnlockingAndRedeemable === false} no={2} />
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t('No redeemable or unstaking funds')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          <NumberPassFail condition={isExposed === undefined ? undefined : isExposed === false} no={3} />
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t('Not being rewarded in the past {{unbondingDuration}} {{day}}', { replace: { unbondingDuration: stakingConsts?.unbondingDuration || '...', day: stakingConsts?.unbondingDuration && stakingConsts.unbondingDuration > 1 ? 'days' : 'day' } })}
          </Typography>
        </Grid>
      </Grid>
      {isEligible === undefined &&
        <Progress pt={'60px'} size={115} title={t('Please wait a few seconds and don\'t close the extension.')} type='grid' />
      }
      <Grid bottom='70px' item position='absolute'>
        {isEligible === true &&
          <Warning
            fontWeight={300}
            theme={theme}
          >
            {t('You can proceed to do fast unstake. Note your stake amount will be available within a few minutes after submitting the transaction.')}
          </Warning>
        }
        {isEligible === false &&
          <Warning
            fontWeight={300}
            iconDanger
            theme={theme}
          >
            {t('This account is not eligible for fast unstake, because the requirements (highlighted above) are not met.')}
          </Warning>
        }
      </Grid>
      <PButton
        _onClick={goTo}
        disabled={isEligible === undefined}
        text={isEligible === undefined || isEligible ? t('Next') : t('Back')}
      />
      {showFastUnstakeReview && formatted && api && transferableBalance && chain && staked && !staked?.isZero() &&
        <FastUnstakeReview
          address={address}
          amount={staked as unknown as BN}
          api={api}
          available={transferableBalance}
          chain={chain}
          formatted={formatted}
          setShow={setShowReview}
          show={showFastUnstakeReview}
        />}
    </Motion>
  );
}
