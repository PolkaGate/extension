// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { AnyTuple } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { type Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, ShowBalance2, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useInfo, useProxies, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToHuman, amountToMachine, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  amount: string;
  chilled: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined
  estimatedFee: Balance | undefined;
  hasNominator: boolean;
  maxUnlockingChunks: number
  redeem: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  redeemDate: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  staked: BN;
  show: boolean;
  total: BN | undefined;
  unlockingLen: number;
  unbonded: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  isUnstakeAll: boolean;
}

export default function Review({ address, amount, chilled, estimatedFee, hasNominator, isUnstakeAll, maxUnlockingChunks, redeem, redeemDate, setShow, show, staked, total, unbonded, unlockingLen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain, decimal, formatted, token } = useInfo(address);
  const proxies = useProxies(api, formatted);
  const name = useAccountDisplay(address);
  const onAction = useContext(ActionContext);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
  }, [address, onAction, setShow]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const unstake = useCallback(async () => {
    try {
      if (!api || !chain || !formatted || !unbonded || !redeem || !chilled || hasNominator === undefined) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);
      const amountAsBN = amountToMachine(amount, decimal);
      const txs = [];

      if (unlockingLen >= maxUnlockingChunks) {
        const optSpans = await api.query['staking']['slashingSpans'](formatted) as any;
        const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1 as number;

        txs.push(redeem(spanCount));
      }

      if ((isUnstakeAll || amount === amountToHuman(staked, decimal)) && hasNominator) {
        txs.push(chilled());
      }

      txs.push(unbonded(amountAsBN));
      const maybeBatchTxs = txs.length > 1 ? api.tx['utility']['batchAll'](txs) : txs[0];
      const maybeProxiedTx = selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, maybeBatchTxs) : maybeBatchTxs;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, maybeProxiedTx, signer, formatted);

      const info = {
        action: 'Solo Staking',
        amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(formatted), name },
        subAction: 'Unstake',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain: chain as any });


      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.error('Unstaking error:', e);
      setIsPasswordError(true);
    }
  }, [amount, api, chain, chilled, decimal, estimatedFee, formatted, hasNominator, maxUnlockingChunks, name, password, redeem, selectedProxy, selectedProxyAddress, selectedProxyName, staked, unbonded, unlockingLen, isUnstakeAll]);

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
          text={t('Unstaking')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '30px' }}>
          <AccountHolderWithProxy
            address={address}
            chain={chain as any}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
          />
          <AmountFee
            address={address}
            amount={amount}
            fee={estimatedFee}
            label={t('Amount')}
            showDivider
            style={{ pt: '5px' }}
            token={token}
            withFee
          >
            <Grid container item justifyContent='center' sx={{ fontSize: '12px', textAlign: 'center', pt: '10px' }}>
              {t('This amount will be redeemable on {{redeemDate}}.', { replace: { redeemDate } })}
            </Grid>
          </AmountFee>
          <AmountFee
            address={address}
            amount={<ShowBalance2 address={address} balance={total} />}
            label={t('Total stake after')}
            style={{ pt: '5px' }}
          />
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
          title={t('Unstaking')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Unstaking')}
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
