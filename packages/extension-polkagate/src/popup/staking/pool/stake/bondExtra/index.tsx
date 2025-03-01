// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { BalancesInfo, MyPoolInfo } from '../../../../../util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, PButton, Warning } from '../../../../../components';
import { useInfo, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../../partials';
import Asset from '../../../../../partials/Asset';
import { MAX_AMOUNT_LENGTH } from '../../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../../util/utils';
import { getValue } from '../../../../account/util';
import ShowPool from '../../../partial/ShowPool';
import Review from './Review';

interface Props {
  api?: ApiPromise;
  address: string;
  balances?: BalancesInfo | undefined;
  formatted?: string;
  pool: MyPoolInfo;
}

export default function BondExtra({ address, api, balances, formatted, pool }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chain, decimal, token } = useInfo(address);
  const history = useHistory();
  const theme = useTheme();

  const [bondAmount, setBondAmount] = useState<string | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);
  const [showReview, setShowReview] = useState<boolean>(false);

  /** since we transfer amount while stake in pools, hence we consider our transferable balance as the total possible staking amount */
  const transferableBalance = useMemo(() => getValue('transferable', balances), [balances]);
  const amountAsBN = useMemo(() => amountToMachine(bondAmount, decimal), [bondAmount, decimal]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`,
      state: { api, pool }
    });
  }, [address, api, history, pool]);

  const onMaxAmount = useCallback(() => {
    if (!api || !transferableBalance || !estimatedMaxFee) {
      return;
    }

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;
    const max = new BN(transferableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setBondAmount(maxToHuman);
  }, [api, transferableBalance, decimal, estimatedMaxFee]);

  const toReview = useCallback(() => {
    setShowReview(!showReview);
  }, [showReview]);

  const bondAmountChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setBondAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  useEffect(() => {
    if (!api || !transferableBalance || !formatted) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api.createType('Balance', BN_ONE) as Balance);
    }

    amountAsBN && api.tx['nominationPools']['bondExtra']({ FreeBalance: amountAsBN.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);

    amountAsBN && api.tx['nominationPools']['bondExtra']({ FreeBalance: transferableBalance.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);
  }, [formatted, api, transferableBalance, bondAmount, decimal, amountAsBN]);

  useEffect(() => {
    if (!amountAsBN || !api || !transferableBalance) {
      return;
    }

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;
    const isAmountInRange = amountAsBN.lt(transferableBalance.sub(ED.muln(2)).sub(estimatedMaxFee || BN_ZERO));

    setNextBtnDisabled(!bondAmount || bondAmount === '0' || !isAmountInRange || !pool || pool?.member?.points as unknown as string === '0');
  }, [amountAsBN, transferableBalance, decimal, estimatedMaxFee, bondAmount, api, pool]);

  const Warn = ({ iconDanger, isDanger, text }: { text: string; isDanger?: boolean; iconDanger?: boolean; }) => (
    <Grid container sx={{ 'div.danger': { mr: '10px', mt: 0, pl: '10px' }, mt: '25px' }}>
      <Warning
        fontWeight={400}
        iconDanger={iconDanger}
        isDanger={isDanger}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Stake')} />
      {(pool?.member?.points as unknown as string) === '0' &&
        <Warn isDanger text={t('The account is fully unstaked, so can\'t stake until you withdraw entire unstaked/redeemable amount.')} />
      }
      <Asset
        address={address}
        api={api}
        balance={transferableBalance}
        balanceLabel={t<string>('Available balance')}
        fee={estimatedFee}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      <AmountWithOptions
        label={t<string>('Amount ({{token}})', { replace: { token: token || '...' } })}
        onChangeAmount={bondAmountChange}
        onPrimary={onMaxAmount}
        primaryBtnText={t<string>('Max amount')}
        style={{
          m: 'auto',
          width: '92%'
        }}
        value={bondAmount}
      />
      <ShowPool
        api={api}
        chain={chain as any}
        label={t<string>('Pool')}
        mode='Default'
        pool={pool}
        showInfo
        style={{
          m: '20px auto 0',
          width: '92%'
        }}
      />
      <Typography fontSize='12px' fontWeight={400} m='20px 0 0' textAlign='center'>
        {t<string>('Outstanding rewards automatically withdrawn after transaction')}
      </Typography>
      <PButton
        _onClick={toReview}
        disabled={nextBtnDisabled}
        text={t<string>('Next')}
      />
      {showReview &&
        <Review
          address={address}
          api={api as ApiPromise}
          bondAmount={amountAsBN}
          estimatedFee={estimatedFee}
          pool={pool}
          setShowReview={setShowReview}
          showReview={showReview}
        />
      }
    </>
  );
}
