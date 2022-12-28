// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { AnyTuple } from '@polkadot/types/types';

import { Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, AmountFee, Identicon, Motion, PasswordUseProxyConfirm, Popup, ShortAddress, Warning } from '../../components';
import { useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../hooks';
import { HeaderBrand, WaitScreen } from '../../partials';
import Confirmation from '../../partials/Confirmation';
import SubTitle from '../../partials/SubTitle';
import ThroughProxy from '../../partials/ThroughProxy';
import broadcast from '../../util/api/broadcast';
import { FLOATING_POINT_DIGIT } from '../../util/constants';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../util/utils';
import SendTxDetail from './partial/SendTxDetail';

type TransferType = 'All' | 'Max' | 'Normal';

interface Props {
  address: string;
  accountName: string | undefined;
  amount: string;
  api: ApiPromise | undefined;
  chain: Chain | null;
  fee: Balance | undefined;
  recipientAddress: string | undefined;
  recipientName: string | undefined;
  transfer: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  transferType: TransferType | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  show: boolean;
  estimatedFee: Balance | undefined;
}

export default function Review({ accountName, address, amount, api, chain, estimatedFee, recipientAddress, recipientName, setShow, show, transfer, transferType }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const theme = useTheme();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [event, setEvent] = useState<any>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const goToMyAccounts = useCallback(() => {
    onAction('/');
  }, [onAction]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  function handleTxEvent (s: CustomEventInit<any>) {
    setEvent(s.detail);
    console.log('state:', s.detail);
  }

  const send = useCallback(async () => {
    try {
      if (!formatted || !transfer || !api || !decimal) {
        return;
      }

      window.addEventListener('transactionState', handleTxEvent);
      // return () => window.removeEventListener("click", handleClick);

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);

      setShowWaitScreen(true);
      let params = [];

      if (['All', 'Max'].includes(transferType)) {
        const keepAlive = transferType === 'Max';

        params = [recipientAddress, keepAlive];
      } else {
        const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimal - FLOATING_POINT_DIGIT)));

        params = [recipientAddress, amountAsBN];
      }

      const { block, failureText, fee, success, txHash } = await broadcast(api, transfer, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Transfer',
        amount,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: from, name: selectedProxyName || accountName },
        subAction: 'Send',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null,
        to: { address: recipientAddress, name: selectedProxyName || recipientName },
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [accountName, amount, api, chain, decimal, estimatedFee, formatted, password, recipientAddress, recipientName, selectedProxy, selectedProxyAddress, selectedProxyName, transfer, transferType]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const Info = ({ pt1 = 0, pt2 = 5, mb = 10, data1, data2, fontSize1 = 28, label, noDivider = false, showIdenticon, showProxy }: { mb?: number, pt1?: number, pt2?: number, fontSize1?: number, label: string, data1: string | Element, data2?: string, noDivider?: boolean, showIdenticon?: boolean, showProxy?: boolean }) => (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
      <Grid item sx={{ fontSize: '16px', pt: `${pt1}px` }}>
        {label}
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' sx={{ pt: `${pt2}px`, lineHeight: '28px' }}>
        {showIdenticon && chain &&
          <Grid item pr='10px' >
            <Identicon
              iconTheme={chain?.icon || 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={31}
              value={data2}
            />
          </Grid>
        }
        <Grid item sx={{ fontSize: `${fontSize1}px`, fontWeight: 400, maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data1}
        </Grid>
      </Grid>
      {data2 &&
        <>
          {showIdenticon
            ? <ShortAddress address={data2} />
            : <Grid item sx={{ fontSize: '16px', fontWeight: 300 }}>
              {data2}
            </Grid>
          }
        </>
      }
      {selectedProxyAddress && showProxy &&
        <ThroughProxy
          address={selectedProxyAddress}
          chain={chain}
          name={selectedProxyName}
        />
      }
      {!noDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mb: `${mb}px`, mt: '5px', width: '240px' }} />
      }
    </Grid>
  );

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          text={t<string>('Send Fund')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <Grid
            color='red'
            height='30px'
            m='auto'
            mt='-10px'
            width='92%'
          >
            <Warning
              fontWeight={400}
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '30px' }}>
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
            title={t('From')}
          />
          <Info data1={recipientName} data2={recipientAddress} label={t('To')} pt1={0} pt2={0} showIdenticon />
          <AmountFee
            address={address}
            amount={amount}
            fee={estimatedFee}
            label={t('Amount')}
            token={token}
            withFee
          />
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          confirmText={t<string>('Send')}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || accountName}`}
          onChange={setPassword}
          onConfirmClick={send}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any']}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setSelectedProxy={setSelectedProxy}
          style={{
            bottom: '80px',
            left: '4%',
            position: 'absolute',
            width: '92%'
          }}
        />
        <WaitScreen
          show={showWaitScreen}
          title={t('Send Fund')}
          event={event}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Send Fund')}
            onPrimaryBtnClick={goToMyAccounts}
            primaryBtnText={t('My accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <SendTxDetail txInfo={txInfo} />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
