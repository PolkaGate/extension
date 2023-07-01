// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake review page
 * */

import type { ApiPromise } from '@polkadot/api';

import { Container } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, WrongPasswordAlert } from '../../components';
import { useAccountName, useChain, useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../partials';
import Confirmation from '../../partials/Confirmation';
import { signAndSend } from '../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../util/utils';

interface Props {
  address: string;
  api: ApiPromise;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  value: BN | undefined;
}

export default function Review({ address, api, setShow, show, value }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const chain = useChain(address);
  const name = useAccountName(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<BN>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);
  const amount = useMemo(() => amountToHuman(value, decimal), [decimal, value]);

  const goToAccount = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
  }, [address, onAction, setShow]);

  const goToHome = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const stake = useCallback(async () => {
    try {
      if (!formatted || !tx) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      let batchCall;

      const extrinsic = batchCall || tx(...params);
      const ptx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, extrinsic) : extrinsic;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, ptx, signer, formatted);

      const info = {
        action: 'Unlock Referenda',
        amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'unlock',
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
  }, [formatted, selectedProxyAddress, password, selectedProxy, api, amount, estimatedFee, name, selectedProxyName, chain]);

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
          text={t<string>('Unlock Referenda')}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '30px' }}>
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
            style={{ mt: '-5px' }}
            title={t('Account holder')}
          />
          <AmountFee
            address={address}
            amount={amount}
            fee={estimatedFee}
            label={t('Amount')}
            showDivider
            token={token}
            withFee
          />
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={stake}
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
          title={t('Staking')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Staking')}
            onPrimaryBtnClick={goToAccount}
            onSecondaryBtnClick={goToHome}
            primaryBtnText={t('My Account')}
            secondaryBtnText={t('Home')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            {/* <TxDetail settings={settings} txInfo={txInfo} /> */}
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
