// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountStakingInfo, StakingConsts } from '../../../../util/types';

import CheckCircleOutlineSharpIcon from '@mui/icons-material/CheckCircleOutlineSharp';
import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Motion, PButton } from '../../../../components';
import { useApi, useBalances, useChain, useDecimal, useFormatted, useIsEligibleForUnstake, useStakingAccount, useStakingConsts, useToken, useTranslation } from '../../../../hooks';
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
  const isEligibleForFastUnstake = useIsEligibleForUnstake(address);

  const fastUnstakeDeposit = api && api.consts.fastUnstake.deposit;
  const balances = useMemo(() => mayBeMyStashBalances || myBalances, [mayBeMyStashBalances, myBalances]);
  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [erasToCheckPerBlock, setErasToCheckPerBlock] = useState<number | undefined>();
  const [showFastUnstakeReview, setShowReview] = useState<boolean>(false);
  const haveEnoughDeposit = fastUnstakeDeposit && stakingConsts && balances && estimatedFee && getValue('available', balances) && fastUnstakeDeposit.add(estimatedFee).lt(getValue('available', balances));
  const unlockingAndRedeemable = redeemable && stakingAccount
    ? redeemable.isZero() || stakingAccount.unlocking?.length === 0
    : undefined;

  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active, [stakingAccount]);
  const tx = api && api.tx.fastUnstake.registerFastUnstake;

  useEffect(() => {
    api && api.query.fastUnstake.erasToCheckPerBlock().then((result) => {
      setErasToCheckPerBlock(result?.toNumber());
    }).catch(console.error);
  }, [api]);

  useEffect((): void => {
    tx && formatted && tx().paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [tx, formatted]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/solo/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const goToReview = useCallback(() => {
    isEligibleForFastUnstake === true && setShowReview(true);
  }, [isEligibleForFastUnstake]);

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
          {t<string>('To be eligible for fast unstake')}:
        </Typography>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px' pt='15px'>
          {haveEnoughDeposit
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: haveEnoughDeposit === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              1
            </Typography>}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Having {{deposit}} {{token}} available to deposit', { replace: { deposit: fastUnstakeDeposit && decimal ? amountToHuman(fastUnstakeDeposit, decimal) : '...', token } })}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          {unlockingAndRedeemable === false
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: unlockingAndRedeemable === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              2
            </Typography>
          }
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('No unlocking or redeemable funds')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          {isEligibleForFastUnstake === true
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: isEligibleForFastUnstake === undefined ? 'action.disabledBackground' : 'warning.main', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              3
            </Typography>
          }
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Not being exposed in the last {{erasToCheckPerBlock}} eras', { replace: { erasToCheckPerBlock: erasToCheckPerBlock || '...' } })}
          </Typography>
        </Grid>
      </Grid>
      {isEligibleForFastUnstake === undefined &&
        <>
          <Grid alignItems='center' container justifyContent='center' mt='60px'>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={75} />
          </Grid>
          <Typography fontSize='15px' fontWeight={300} m='20px auto 0' textAlign='center'>
            {t<string>('Checking fast unstake eligibility ...')}
          </Typography>
        </>
      }
      <PButton
        _onClick={goToReview}
        disabled={!isEligibleForFastUnstake || unlockingAndRedeemable || !haveEnoughDeposit}
        text={t<string>('Next')}
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

