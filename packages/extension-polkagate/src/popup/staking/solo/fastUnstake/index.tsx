// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import CheckCircleOutlineSharpIcon from '@mui/icons-material/CheckCircleOutlineSharp';
import { Grid, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN_ONE } from '@polkadot/util';

import { Motion, PButton, Warning } from '../../../../components';
import { useApi, useBalances, useChain, useDecimal, useFormatted, useIsExposed, useStakingAccount, useStakingConsts, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { amountToHuman } from '../../../../util/utils';
import { getValue } from '../../../account/util';
import FastUnstakeReview from './Review';

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
  const stakingAccount = useStakingAccount(formatted, state?.stakingAccount);
  const myBalances = useBalances(address);
  const mayBeMyStashBalances = useBalances(stakingAccount?.stashId);

  const stakingConsts = useStakingConsts(address, state?.stakingConsts);
  const decimal = useDecimal(address);
  const isExposed = useIsExposed(address);

  const fastUnstakeDeposit = api && api.consts.fastUnstake.deposit;
  const balances = useMemo(() => mayBeMyStashBalances || myBalances, [mayBeMyStashBalances, myBalances]);
  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [showFastUnstakeReview, setShowReview] = useState<boolean>(false);
  const hasEnoughDeposit = fastUnstakeDeposit && stakingConsts && balances && estimatedFee && getValue('available', balances) && fastUnstakeDeposit.add(estimatedFee).lt(getValue('available', balances));
  const hasUnlockingAndRedeemable = redeemable && stakingAccount
    ? !!(!redeemable.isZero() || stakingAccount.unlocking?.length)
    : undefined;

  const isEligible = isExposed !== undefined && hasUnlockingAndRedeemable !== undefined && hasEnoughDeposit !== undefined
    ? !isExposed && !hasUnlockingAndRedeemable && hasEnoughDeposit
    : undefined;

  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active, [stakingAccount]);
  const tx = api && api.tx.fastUnstake.registerFastUnstake;

  useEffect((): void => {
    if (!api) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    tx && formatted && tx().paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, tx, formatted]);

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
        label={t('Fast Unstake')}
        withSteps={{ current: 1, total: 2 }}
      />
      <Grid container direction='column' m='20px auto' width='85%'>
        <Typography fontSize='14px' fontWeight={300}>
          {t<string>('Checking fast unstake eligibility')}:
        </Typography>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px' pt='15px'>
          {hasEnoughDeposit
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: hasEnoughDeposit === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              1
            </Typography>}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Having {{deposit}} {{token}} available to deposit', { replace: { deposit: fastUnstakeDeposit && decimal ? amountToHuman(fastUnstakeDeposit, decimal) : '...', token } })}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          {hasUnlockingAndRedeemable === false
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: hasUnlockingAndRedeemable === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              2
            </Typography>
          }
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('No redeemable or unstaking funds')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          {isExposed === false
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: isExposed === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              3
            </Typography>
          }
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Not being rewarded in the past {{unbondingDuration}} {{day}}', { replace: { unbondingDuration: stakingConsts?.unbondingDuration || '...', day: stakingConsts?.unbondingDuration && stakingConsts.unbondingDuration > 1 ? 'days' : 'day' } })}
          </Typography>
        </Grid>
      </Grid>
      {isEligible === undefined &&
        <>
          <Grid alignItems='center' container justifyContent='center' mt='60px'>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={115} />
          </Grid>
          <Typography fontSize='18px' fontWeight={300} mt='20px' px='20px' width='fit-content' align='center'>
            {t<string>('Please wait a few seconds and don\'t close the extension.')}
          </Typography>
        </>
      }
      <Grid bottom='70px' item position='absolute'>
        {isEligible === true &&
          <Warning
            fontWeight={300}
            theme={theme}
          >
            {t<string>('You can proceed to do fast unstake. Note your stake amount will be available within a few minutes after submitting the transaction.')}
          </Warning>
        }
        {isEligible === false &&
          <Warning
            fontWeight={300}
            iconDanger
            theme={theme}
          >
            {t<string>('This account is not eligible for fast unstake, because the requirements (highlighted above) are not met.')}
          </Warning>
        }
      </Grid>
      <PButton
        _onClick={goTo}
        disabled={isEligible === undefined}
        text={isEligible === undefined || isEligible ? t<string>('Next') : t<string>('Back')}
      />
      {showFastUnstakeReview && formatted && api && getValue('available', balances) && chain && staked && !staked?.isZero() &&
        <FastUnstakeReview
          address={address}
          amount={staked}
          api={api}
          available={getValue('available', balances)}
          chain={chain}
          formatted={formatted}
          setShow={setShowReview}
          show={showFastUnstakeReview}
        />}
    </Motion>
  );
}

