// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens
 * */

import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, ButtonWithCancel, ChainLogo, Identicon, AmountWithOptions, Motion, SettingsContext, ShortAddress, To } from '../../components';
import { useApi, useEndpoint, useMetadata, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../util/constants';
import { FormattedAddressState } from '../../util/types';
import { amountToHuman, getFormattedAddress } from '../../util/utils';
import BalanceFee from './partial/BalanceFee';
import Asset from './partial/Asset';

interface Props {
  className?: string;
}

type TransferType = 'All' | 'Max' | 'Normal';
interface State {
  recipientAddress: string | undefined;
  recipientName: string | undefined;
  amount: string | undefined;
  balances: DeriveBalancesAll | undefined;
}

export default function Send({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const history = useHistory();
  const { pathname, state } = useLocation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);

  const { address, formatted, genesisHash } = useParams<FormattedAddressState>();
  const chain = useMetadata(genesisHash, true);
  const endpoint = useEndpoint(address, chain);
  const api = useApi(endpoint);
  const [apiToUse, setApiToUse] = useState<ApiPromise | undefined>(state?.api);

  const [fee, setFee] = useState<Balance>();
  const [maxFee, setMaxFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string | undefined>();
  const [amount, setAmount] = useState<string>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>(state?.balances as DeriveBalancesAll);
  const [transferType, setTransferType] = useState<TransferType | undefined>();
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [identity, setIdentity] = useState<DeriveAccountRegistration | undefined>();

  const decimals = apiToUse?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const accountName = useMemo(() => accounts?.find((a) => a.address === address)?.name, [accounts, address]);
  const transfer = apiToUse && apiToUse.tx?.balances && (['All', 'Max'].includes(transferType) ? (apiToUse.tx.balances.transferAll) : (apiToUse.tx.balances.transferKeepAlive));
  const recipientName = useMemo(
    (): string => {
      if (state?.recipientName) {
        return state?.recipientName as string;
      }

      return identity?.display || accounts?.find((a) => getFormattedAddress(a.address, chain, settings?.prefix) === recipientAddress)?.name || t('Unknown');
    },
    [state?.recipientName, identity?.display, accounts, t, chain, settings?.prefix, recipientAddress]
  );

  useEffect((): void => {
    // eslint-disable-next-line no-void
    apiToUse && recipientAddress && void apiToUse.derive.accounts.info(recipientAddress).then((info) => {
      setIdentity(info?.identity);
    });
  }, [apiToUse, recipientAddress]);

  useEffect((): void => {
    state?.recipientAddress && setRecipientAddress(state?.recipientAddress);
  }, [state?.recipientAddress]);


  const setWholeAmount = useCallback((type: TransferType) => {
    if (!api || !balances?.availableBalance || !maxFee) {
      return;
    }

    setTransferType(type);
    const ED = type === 'Max' ? api.consts.balances.existentialDeposit as unknown as BN : BN_ZERO;
    const allMaxAmount = balances.availableBalance.isZero() ? '0' : amountToHuman(balances.availableBalance.sub(maxFee).sub(ED).toString(), decimals);

    setAmount(allMaxAmount);
  }, [api, balances?.availableBalance, decimals, maxFee]);

  useEffect(() => {
    const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));
    const isAmountGreaterThanAllTransferAble = amountAsBN.gt(balances?.availableBalance?.sub(maxFee ?? BN_ZERO) ?? BN_ZERO);

    // setButtonDisabled(!isValidAddress(recipientAddress) || !(amount || allMaxAmount) || isAmountGreaterThanAllTransferAble || !password);
    setButtonDisabled(!(amount) || (amount === '0') || isAmountGreaterThanAllTransferAble);
  }, [amount, api, balances?.availableBalance, decimals, maxFee, recipientAddress]);

  useEffect(() => {
    api && !apiToUse && setApiToUse(api);
  }, [api, apiToUse]);

  useEffect(() => {
    setTransferType('Normal');
  }, [amount]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    endpoint && apiToUse && void apiToUse.derive.balances?.all(formatted).then((b) => {
      setBalances(b);
    });
  }, [apiToUse, formatted, endpoint]);

  useEffect(() => {
    if (!apiToUse || !transfer || amount) {
      return;
    }

    let params = [];

    if (['All', 'Max'].includes(transferType)) {
      const keepAlive = transferType === 'Max';

      params = [formatted, keepAlive]; // just for fee calculation, sender and receiver are the same
    } else {
      const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));

      params = [formatted, amountAsBN];
    }

    // eslint-disable-next-line no-void
    void transfer(...params).paymentInfo(formatted)
      .then((i) => setFee(i?.partialFee)).catch(console.error);
  }, [apiToUse, formatted, transfer, amount, decimals, transferType]);

  useEffect(() => {
    if (!apiToUse || !transfer || !balances) { return; }

    // eslint-disable-next-line no-void
    void transfer(formatted, balances.availableBalance).paymentInfo(formatted)
      .then((i) => setMaxFee(i?.partialFee)).catch(console.error);
  }, [apiToUse, formatted, transfer, balances]);

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
    history.push({
      pathname: `/account/${genesisHash}/${address}/${formatted}/`,
      state: { balances, api: apiToUse, price: state?.price as number | undefined }
    });
  }, [address, apiToUse, balances, formatted, genesisHash, history, state?.price]);

  const goToReview = useCallback(() => {
    balances && history.push({
      pathname: `/send/review/${genesisHash}/${address}/${formatted}/`,
      state: {
        accountName,
        amount,
        api: apiToUse,
        backPath: pathname,
        balances,
        chain,
        fee,
        recipientAddress,
        recipientName,
        transfer,
        transferType
      }
    });
  }, [accountName, address, amount, apiToUse, balances, chain, fee, formatted, genesisHash, history, pathname, recipientAddress, recipientName, transfer, transferType]);

  const _onChangeAmount = useCallback((value: string) => {
    if (parseInt(value).toString().length > decimals - 1) {
      console.log(`The amount digits is more than decimal:${decimals}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimals]);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      // isExternal={isExternal}
      // onCopy={_onCopy}
      prefix={chain?.ss58Format ?? 42}
      size={31}
      value={formatted}
    />
  );

  const From = () => (
    <>
      <div style={{ fontSize: '16px', fontWeight: 300 }}>
        {t('From')}
      </div>
      <Grid alignItems='center' container justifyContent='felx-start' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, p: '5px', mt: '2px' }}>
        <Grid item mx='5px'>
          {identicon}
        </Grid>
        <Grid
          item
          sx={{ fontSize: '28px', fontWeight: 400, lineHeight: '25px', maxWidth: '50%', mr: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {accountName}
        </Grid>
        <Grid item>
          <ShortAddress address={formatted} addressStyle={{ fontSize: '16px', fontWeight: 300, justifyContent: 'flex-start', pt: '5px' }} />
        </Grid>
      </Grid>
    </>
  );

  // const Asset = () => (
  //   <Grid container item sx={{ pt: '10px' }} xs={12}>
  //     <div style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
  //       {t('Asset')}
  //     </div>
  //     <Grid alignItems='center' container item justifyContent='space-between' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, p: '5px 10px' }}>
  //       <Grid container item xs={1.5}>
  //         <ChainLogo genesisHash={genesisHash} size={31} />
  //       </Grid>
  //       <Grid container item sx={{ fontSize: '16px', fontWeight: 300 }} xs={5}>
  //         <Grid item>
  //           {t('Available balance')}
  //           <br />
  //           {t('Fee')}
  //         </Grid>
  //       </Grid>
  //       <Grid container item justifyContent='flex-end' xs>
  //         <BalanceFee api={apiToUse} balances={balances} fee={fee} type='available' />
  //       </Grid>
  //     </Grid>
  //   </Grid>
  // );

  return (
    <Motion>
      <HeaderBrand
        onBackClick={_onBackClick}
        shortBorder
        showBackArrow
        text={t<string>('Send Fund')}
        withSteps={{
          currentStep: 1,
          totalSteps: 2
        }}
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <From />
        <To
          address={recipientAddress}
          chain={chain}
          label={t('To')}
          name={recipientName}
          setAddress={setRecipientAddress}
          style={{ pt: '10px' }}
        />
        <Asset
          api={apiToUse}
          balanceLabel={t('Available balance')}
          balanceType='available'
          balances={balances}
          fee={fee}
          genesisHash={genesisHash}
        />
        <AmountWithOptions
          label={t<string>('Amount')}
          onChangeAmount={_onChangeAmount}
          onPrimary={() => setWholeAmount('Max')}
          onSecondary={() => setWholeAmount('All')}
          primaryBtnText={t<string>('All amount')}
          secondaryBtnText={t<string>('Max amount')}
          value={amount}
        />
      </Container>
      <ButtonWithCancel
        _onClick={goToReview}
        _onClickCancel={_onBackClick}
        disabled={buttonDisabled}
        text={t('Next')}
      />
    </Motion>
  );
}
