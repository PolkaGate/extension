// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import { Container,Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, Warning, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useApi, useChain, useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import { ValidatorEra } from './PendingRewards';
import TxDetail from './TxDetail';

interface Props {
  address: string;
  amount: BN;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  selectedToPayout: ValidatorEra[]
}

export default function Review({ address, amount, selectedToPayout, setShow, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const decimal = useDecimal(address);
  const name = useAccountDisplay(address);
  const proxies = useProxies(api, formatted);
  const token = useToken(address);
  const onAction = useContext(ActionContext);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const amountInHuman = amountToHuman(amount, decimal);
  const [tx, setTx] = useState<SubmittableExtrinsic<'promise', ISubmittableResult> | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const payoutStakers = api && api.tx.staking.payoutStakers;
  const batch = api && api.tx.utility.batchAll;

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
  }, [address, onAction, setShow]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    if (!payoutStakers || !batch || !selectedToPayout) {
      return;
    }

    const _tx = selectedToPayout.length === 1
      ? payoutStakers(selectedToPayout[0][0], selectedToPayout[0][1])
      : batch(selectedToPayout.map((p) => payoutStakers(p[0], p[1])));

    setTx(_tx);
  }, [batch, payoutStakers, selectedToPayout]);

  useEffect((): void => {
    if (!tx || !formatted) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    tx.paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, tx]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const unstake = useCallback(async () => {
    try {
      if (!api || !tx || !formatted || !chain) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const ptx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, ptx, signer, formatted);

      const info = {
        action: 'Solo Staking',
        amount: amountInHuman,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(formatted), name },
        subAction: 'Payout Rewards',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [amountInHuman, api, chain, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Payout')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '20px' }}>
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
          />
          <AmountFee
            address={address}
            amount={amountInHuman}
            fee={estimatedFee}
            label={t('Amount')}
            showDivider
            style={{ pt: '5px' }}
            token={token}
            withFee
          />
          <Grid container justifyContent='center'>
            <Warning
              marginTop={2}
              theme={theme}
            >
              {t<string>('Usually, validators pay out the pending rewards themselves, but you can initiate the payout yourself if you prefer.')}
            </Warning>
          </Grid>
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={unstake}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'Staking']}
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
          title={t('Payout')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Payout')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail txInfo={txInfo} />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
