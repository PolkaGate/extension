// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens social recovery index page to choose between configuring your account and rescuing other account
 * */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Avatar, Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { isend, send } from '../../assets/icons';
import { AccountContext, ActionContext, Amount, ChainLogo, Identicon, Motion, Password, PButton, SettingsContext, ShortAddress, ShowBalance, To } from '../../components';
import { useApi, useEndpoint, useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT } from '../../util/constants';
import { FormattedAddressState } from '../../util/types';
import { amountToHuman, getFormattedAddress, isValidAddress } from '../../util/utils';
import LabelBalancePrice from '../account/LabelBalancePrice';
import BalanceFee from './BalanceFee';

interface Props {
  className?: string;
}

type TransferType = 'All' | 'Max' | 'Normal';

export default function Send({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const onAction = useContext(ActionContext);

  const history = useHistory();
  const theme = useTheme();
  const { address, formatted, genesisHash } = useParams<FormattedAddressState>();
  const { state } = useLocation();
  const chain = useMetadata(genesisHash, true);
  const { accounts } = useContext(AccountContext);
  const endpoint = useEndpoint(address, chain);
  const api = useApi(endpoint);
  const [apiToUse, setApiToUse] = useState<ApiPromise | undefined>(state?.api);
  const [fee, setFee] = useState<Balance>();
  const [maxFee, setMaxFee] = useState<Balance>();
  const [recepient, setRecipient] = useState<string | undefined>(state?.recepient);
  const [amount, setAmount] = useState<string>(state?.amount ?? '0');
  const [allMaxAmount, setAllMaxAmount] = useState<string | undefined>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>(state?.balances as DeriveBalancesAll);
  const [transferType, setTransferType] = useState<TransferType | undefined>();
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [identity, setIdentity] = useState<DeriveAccountRegistration | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);

  const [step1, setStep1] = useState(true);

  const prevUrl = `/account/${genesisHash}/${address}/${formatted}/`;
  const decimals = apiToUse?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const accountName = useMemo(() => accounts?.find((a) => a.address === address)?.name, [accounts, address]);
  const transfer = apiToUse && apiToUse.tx?.balances && (['All', 'Max'].includes(transferType) ? (apiToUse.tx.balances.transferAll) : (apiToUse.tx.balances.transferKeepAlive));

  useEffect((): void => {
    // eslint-disable-next-line no-void
    apiToUse && recepient && void apiToUse.derive.accounts.info(recepient).then((info) => {
      setIdentity(info?.identity);
    });
  }, [apiToUse, recepient]);

  const recepientName = useMemo(
    (): string =>
      identity?.display || accounts?.find((a) => getFormattedAddress(a.address, chain, settings?.prefix) === recepient)?.name || t('Unknown'),
    [accounts, chain, recepient, settings?.prefix, t, identity]
  );

  const setWholeAmount = useCallback((type: TransferType) => {
    if (!api || !balances?.availableBalance || !maxFee) {
      return;
    }

    setTransferType(type);
    const ED = type === 'Max' ? api.consts.balances.existentialDeposit as unknown as BN : BN_ZERO;
    const allMaxAmount = balances.availableBalance.isZero() ? '0' : amountToHuman(balances.availableBalance.sub(maxFee).sub(ED).toString(), decimals);

    setAllMaxAmount(allMaxAmount);
  }, [api, balances?.availableBalance, decimals, maxFee]);

  const goToReview = useCallback(() => {
    balances && history.push({
      pathname: `/send/review/${genesisHash}/${address}/${formatted}/`,
      state: { amount: allMaxAmount ?? amount, api: apiToUse, balances, fee, recepient, recepientName, transfer, transferType }
    });
  }, [balances, history, genesisHash, address, formatted, allMaxAmount, amount, apiToUse, fee, recepient, recepientName, transfer, transferType]);

  const onChangePass = useCallback(
    (pass: string): void => {
      setPassword(pass);
      setIsPasswordError(false);
    }, []
  );

  useEffect(() => {
    const amountAsBN = new BN(parseFloat(parseFloat(allMaxAmount ?? amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));
    const isAmountGreaterThanAllTransferAble = amountAsBN.gt(balances?.availableBalance?.sub(maxFee ?? BN_ZERO) ?? BN_ZERO);

    setButtonDisabled(!isValidAddress(recepient) || !(amount || allMaxAmount) || isAmountGreaterThanAllTransferAble || !password);
  }, [allMaxAmount, amount, api, balances?.availableBalance, decimals, maxFee, password, recepient]);

  useEffect(() => {
    api && setApiToUse(api);
  }, [api]);

  useEffect(() => {
    setAllMaxAmount(undefined);
    setTransferType('Normal');
  }, [amount]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    endpoint && apiToUse && void apiToUse.derive.balances?.all(formatted).then((b) => {
      setBalances(b);
    });
  }, [apiToUse, formatted, endpoint]);

  useEffect(() => {
    if (!apiToUse || !transfer) { return; }

    const amountAsBN = new BN(parseFloat(parseFloat(allMaxAmount ?? amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));

    const keepAlive = transferType === 'Max';
    const params = ['All', 'Max'].includes(transferType) ? [formatted, keepAlive] : [formatted, amountAsBN];

    // eslint-disable-next-line no-void
    void transfer(...params).paymentInfo(formatted)
      .then((i) => setFee(i?.partialFee)).catch(console.error);
  }, [apiToUse, formatted, transfer, amount, decimals, allMaxAmount, transferType]);

  useEffect(() => {
    if (!apiToUse || !transfer || !balances) { return; }

    // eslint-disable-next-line no-void
    void transfer(formatted, balances.availableBalance).paymentInfo(formatted)
      .then((i) => setMaxFee(i?.partialFee)).catch(console.error);
  }, [apiToUse, formatted, transfer, balances]);

  const _onCancelClick = useCallback(
    () => setStep1(true),
    []
  );

  const _onBackClick = useCallback(() => {
    step1
      ? history.push({
        pathname: `/account/${genesisHash}/${address}/${formatted}/`,
        state: { balances, api: apiToUse, price: state?.price as number | undefined }
      })
      : _onCancelClick();
  }, [_onCancelClick, address, apiToUse, balances, formatted, genesisHash, history, state?.price, step1]);

  const From = () => (
    <>
      <div style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
        {t('From')}
      </div>
      <Grid container justifyContent='space-between' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, p: '10px' }}>
        <Grid item sx={{ fontSize: '28px', fontWeight: 400, lineHeight: '25px' }}>
          {accountName}
          <ShortAddress address={formatted} addressStyle={{ fontSize: '16px', fontWeight: 300, justifyContent: 'flex-start' }} />
        </Grid>
        <Grid item>
          <LabelBalancePrice api={apiToUse} balances={balances} label='Total' price={state?.price} showLabel={false} />
        </Grid>

      </Grid>
    </>
  );

  const Asset = () => (
    <Grid container item sx={{ pt: '10px' }} xs={12}>
      <div style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
        {t('Asset')}
      </div>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, p: '5px 10px' }}>
        <Grid container item xs={1.5}>
          <ChainLogo genesisHash={genesisHash} size={31} />
        </Grid>
        <Grid container item sx={{ fontSize: '16px', fontWeight: 300 }} xs={5}>
          <Grid item>
            {t('Available balance')}
            <br />
            {t('Fee')}
          </Grid>
        </Grid>
        <Grid container item justifyContent='flex-end' xs>
          <BalanceFee api={apiToUse} balances={balances} type='available' fee={fee} />
        </Grid>
      </Grid>
    </Grid>
  );

  const AmountWithMaxAll = () => (
    <>
      <div style={{ fontSize: '16px', paddingTop: '10px', fontWeight: 300, letterSpacing: '-0.015em' }}>
        {t('Amount')}
      </div>
      <Grid container item xs={12}>
        <Grid item xs={8}>
          <Amount decimals={decimals} setValue={setAmount} token={apiToUse?.registry?.chainTokens[0]} value={allMaxAmount ?? amount} />
        </Grid>
        <Grid container item xs={4} sx={{ pl: '10px' }}>
          <Grid item onClick={() => setWholeAmount('All')} sx={{ textDecorationLine: 'underline', cursor: 'pointer' }}>
            {t('All amount')}
          </Grid>
          <Grid item onClick={() => setWholeAmount('Max')} sx={{ textDecorationLine: 'underline', cursor: 'pointer' }}>
            {t('Max amount')}
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={_onBackClick}
        shortBorder
        showBackArrow
        text={t<string>('Send Fund')}
        withSteps={{
          currentStep: `${step1 ? 1 : 2}`,
          totalSteps: 2
        }}
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <From />
        <To address={recepient} label={t('To')} name={recepientName} setAddress={setRecipient} style={{ pt: '5px' }} />
        <Asset />
        <AmountWithMaxAll />
        <div style={{ paddingTop: '10px' }}>
          <Password
            isError={isPasswordError}
            label={t<string>('Password')}
            onChange={onChangePass}
          />
        </div>
      </Container>
      <PButton
        _onClick={goToReview}
        _variant='contained'
        disabled={buttonDisabled}
        text={t('Next')}
      />
    </Motion>
  );
}
