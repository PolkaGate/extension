// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, PButton, ShowBalance } from '../../../../components';
import { useApi, useFormatted, usePoolConsts, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { PoolStakingConsts } from '../../../../util/types';
import { amountToHuman } from '../../../../util/utils';

interface State {
  api?: ApiPromise;
  availableBalance: Balance;
  poolStakingConsts: PoolStakingConsts;
  pathname: string;
}

export default function JoinPool(): React.ReactElement {
  const { t } = useTranslation();

  const { address } = useParams<{ address: string }>();
  const { pathname, state } = useLocation<State>();
  const [stakeAmount, setStakeAmount] = useState<string | undefined>();
  const formatted = useFormatted(address);
  const api = useApi(address, state?.api);
  const poolStakingConsts = usePoolConsts(address, state?.consts);
  const history = useHistory();

  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

  const decimals = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const token = api?.registry?.chainTokens[0] ?? '...';

  const backToStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const stakeAmountChange = useCallback((value: string) => {
    if (value.length > decimals - 1) {
      console.log(`The amount digits is more than decimal:${decimals}`);

      return;
    }

    setStakeAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimals]);

  const onMinAmount = useCallback(() => {
    poolStakingConsts?.minJoinBond && setStakeAmount(amountToHuman(poolStakingConsts.minJoinBond.toString(), decimals));
  }, [decimals, poolStakingConsts?.minJoinBond]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedMaxFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(availableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimals);

    maxToHuman && setStakeAmount(maxToHuman);
  }, [api, availableBalance, decimals, estimatedMaxFee]);

  const toReview = useCallback(() => {
    console.log('Go to review clicked!');
  }, []);

  useEffect(() => {
    if (!api || !availableBalance || !formatted) { return; }

    const amountAsBN = new BN(parseFloat(parseFloat(stakeAmount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));

    api && api.tx.nominationPools.join(amountAsBN.toString(), BN_ONE).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    });

    api && api.tx.nominationPools.join(String(availableBalance), BN_ONE).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee));
    });
  }, [formatted, api, availableBalance, stakeAmount, decimals]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    !state?.availableBalance && api && formatted && void api.derive.balances?.all(formatted).then((b) => {
      setAvailableBalance(b.availableBalance);
    });
    state?.availableBalance && setAvailableBalance(state?.availableBalance);
  }, [formatted, api, state?.availableBalance]);

  return (
    <>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Join Pool')} />
      <AmountWithOptions
        label={t<string>(`Amount (${token ?? '...'})`)}
        onChangeAmount={stakeAmountChange}
        onPrimary={onMinAmount}
        onSecondary={onMaxAmount}
        primaryBtnText={t<string>('Min amount')}
        secondaryBtnText={t<string>('Max amount')}
        style={{
          m: '20px auto 10px',
          width: '92%'
        }}
        value={stakeAmount}
      />
      <Grid
        alignItems='end'
        container
        sx={{
          m: 'auto',
          width: '92%'
        }}
      >
        <Typography
          fontSize='14px'
          fontWeight={300}
          lineHeight='23px'
        >
          {t<string>('Fee:')}
        </Typography>
        <Grid
          item
          lineHeight='22px'
          pl='5px'
        >
          <ShowBalance
            api={api}
            balance={estimatedFee}
            decimalPoint={4}
            height={22}
          />
        </Grid>
      </Grid>
      <PButton
        _onClick={toReview}
        disabled={nextBtnDisabled}
        text={t<string>('Next')}
      />
    </>
  );
}
