// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ExpandedRewards } from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/pending';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, Warning, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import TxDetail from './TxDetail';

interface Props {
  address: string;
  amount: BN;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  selectedToPayout: ExpandedRewards[]
}

export default function Review({ address, amount, selectedToPayout, setShow, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, decimal, formatted, token } = useInfo(address);
  const name = useAccountDisplay(address);
  const proxies = useProxies(api, formatted);
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

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const payoutStakers = api?.tx['staking']['payoutStakersByPage'];
  const batch = api?.tx['utility']['batchAll'];

  const estimatedFee = useEstimatedFee(address, tx);

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
      ? payoutStakers(selectedToPayout[0][1], Number(selectedToPayout[0][0]), selectedToPayout[0][2])
      : batch(selectedToPayout.map((p) => payoutStakers(p[1], Number(p[0]), p[2])));

    setTx(_tx);
  }, [batch, payoutStakers, selectedToPayout]);

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

      const ptx = selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, tx) : tx;
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

      setTxInfo({ ...info, api, chain: chain as any });

      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [amountInHuman, api, chain, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  const onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t('Payout')}
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
            chain={chain as any}
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
              {t('Usually, validators pay out the pending rewards themselves, but you can initiate the payout yourself if you prefer.')}
            </Warning>
          </Grid>
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={unstake}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={PROXY_TYPE.STAKING}
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
