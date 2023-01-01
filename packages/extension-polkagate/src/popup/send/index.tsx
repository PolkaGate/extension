// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens
 * */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Container } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountInputWithIdentity, AmountWithOptions, Motion, PButton } from '../../components';
import { useAccountInfo, useAccountName, useApi, useChain, useDecimal, useEndpoint, useFormatted, useMyAccountIdentity, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../util/constants';
import { FormattedAddressState } from '../../util/types';
import { amountToHuman, isValidAddress } from '../../util/utils';
import Asset from './partial/Asset';
import From from './partial/From';
import Review from './Review';


type TransferType = 'All' | 'Max' | 'Normal';

// TODO: can use useMyAccountIdentity
export default function Send(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const { address } = useParams<FormattedAddressState>();
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const endpoint = useEndpoint(address, chain);
  const api = useApi(address);
  const decimal = useDecimal(address);
  const accountName = useAccountName(address);
  const myIdentity = useMyAccountIdentity(address);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [maxFee, setMaxFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string | undefined>();
  const recipientNameIfIsInExtension = useAccountName(recipientAddress);
  const recipientInfo = useAccountInfo(api, recipientAddress);
  const [amount, setAmount] = useState<string>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>();
  const [transferType, setTransferType] = useState<TransferType | undefined>();
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [recipientName, setRecipientName] = useState<string>();
  const [showReview, setShowReview] = useState<boolean>();

  const transfer = api && api.tx?.balances && (['All', 'Max'].includes(transferType) ? (api.tx.balances.transferAll) : (api.tx.balances.transferKeepAlive));

  useEffect(() => {
    setRecipientName(recipientInfo?.identity?.display || recipientNameIfIsInExtension || t('Unknown'));
  }, [recipientInfo?.identity?.display, recipientNameIfIsInExtension, t]);

  const setWholeAmount = useCallback((type: TransferType) => {
    if (!api || !balances?.availableBalance || !maxFee || !decimal) {
      return;
    }

    setTransferType(type);
    const ED = type === 'Max' ? api.consts.balances.existentialDeposit as unknown as BN : BN_ZERO;
    const allMaxAmount = balances.availableBalance.isZero() ? '0' : amountToHuman(balances.availableBalance.sub(maxFee).sub(ED).toString(), decimal);

    setAmount(allMaxAmount);
  }, [api, balances?.availableBalance, decimal, maxFee]);

  useEffect(() => {
    if (!decimal) {
      return;
    }

    const amountAsBN = new BN(parseFloat(parseFloat(amount ?? '0').toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimal - FLOATING_POINT_DIGIT)));
    const isAmountLessThanAllTransferAble = amountAsBN.gt(balances?.availableBalance?.sub(maxFee ?? BN_ZERO) ?? BN_ZERO);

    setButtonDisabled(!isValidAddress(recipientAddress) || !amount || (amount === '0') || isAmountLessThanAllTransferAble);
  }, [amount, api, balances?.availableBalance, decimal, maxFee, recipientAddress]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    endpoint && api && void api.derive.balances?.all(formatted).then((b) => {
      setBalances(b);
    });
  }, [api, formatted, endpoint]);

  useEffect(() => {
    if (!api || !transfer || !formatted || !amount || !decimal || !transferType) {
      return;
    }

    let params = [];

    if (['All', 'Max'].includes(transferType)) {
      const keepAlive = transferType === 'Max';

      params = [formatted, keepAlive]; // just for estimatedFee calculation, sender and receiver are the same
    } else {
      const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimal - FLOATING_POINT_DIGIT)));

      params = [formatted, amountAsBN];
    }

    // eslint-disable-next-line no-void
    void transfer(...params).paymentInfo(formatted)
      .then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, transfer, amount, decimal, transferType]);

  useEffect(() => {
    api && transfer && balances && formatted && transfer(formatted, balances.availableBalance).paymentInfo(formatted)
      .then((i) => setMaxFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, transfer, balances]);

  useEffect(() => {
    cryptoWaitReady()
      .then((): void => {
        console.log('keyring is loading');

        // load all the keyring data
        keyring.loadAll({ store: new AccountsStore() });

        console.log('keyring load completed');
      })
      .catch((error): void => {
        console.error('keyring load failed', error);
      });
  }, []);

  const _onBackClick = useCallback(() => {
    chain?.genesisHash && history.push({
      pathname: `/account/${chain?.genesisHash}/${address}/`,
    });
  }, [address, chain?.genesisHash, history]);

  const goToReview = useCallback(() => {
    setShowReview(true);
  }, []);

  const _onChangeAmount = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setTransferType('Normal');

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  return (
    <Motion>
      <HeaderBrand
        onBackClick={_onBackClick}
        shortBorder
        showBackArrow
        text={t<string>('Send Fund')}
        withSteps={{
          current: 1,
          total: 2
        }}
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <From
          address={address}
          api={api}
          judgement={myIdentity?.judgement}
          name={myIdentity?.display}
        />
        <AccountInputWithIdentity
          address={recipientAddress}
          chain={chain}
          ignoreAddress={formatted}
          label={t('To')}
          name={recipientName}
          setAddress={setRecipientAddress}
          style={{ pt: '15px' }}
        />
        <Asset
          address={address}
          api={api}
          balanceLabel={t('Available balance')}
          balanceType='available'
          balances={balances}
          fee={estimatedFee}
          style={{ pt: '15px' }}
        />
        <AmountWithOptions
          label={t<string>('Amount')}
          onChangeAmount={_onChangeAmount}
          onPrimary={() => setWholeAmount('Max')}
          onSecondary={() => setWholeAmount('All')}
          primaryBtnText={t<string>('Max amount')}
          secondaryBtnText={t<string>('All amount')}
          value={amount}
          style={{ pt: '15px' }}
        />
      </Container>
      <PButton
        _onClick={goToReview}
        disabled={buttonDisabled}
        text={t<string>('Next')}
      />
      {showReview && amount &&
        <Review
          accountName={accountName}
          address={address}
          amount={amount}
          api={api}
          chain={chain}
          estimatedFee={estimatedFee}
          recipientAddress={recipientAddress}
          recipientName={recipientName}
          setShow={setShowReview}
          show={showReview}
          transfer={transfer}
          transferType={transferType}
        />
      }
    </Motion>
  );
}
