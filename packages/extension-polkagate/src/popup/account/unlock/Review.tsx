// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unlock review page
 * */

import type { ApiPromise } from '@polkadot/api';

import { useTheme } from '@emotion/react';
import { Container } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE, isBn } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, Warning, WrongPasswordAlert } from '../../../components';
import { useAccountDisplay, useChain, useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../../hooks';
import { Lock } from '../../../hooks/useAccountLocks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../partials';
import { signAndSend } from '../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import Confirmation from './Confirmation';

interface Props {
  address: string;
  api: ApiPromise;
  classToUnlock: Lock[]
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  unlockableAmount: BN;
  totalLocked: BN;
}

export default function Review({ address, api, classToUnlock, setShow, show, totalLocked, unlockableAmount }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const theme = useTheme();
  const proxies = useProxies(api, formatted);
  const chain = useChain(address);
  const name = useAccountDisplay(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const onAction = useContext(ActionContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<BN>();
  const [params, setParams] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>[]>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const amount = useMemo(() => amountToHuman(unlockableAmount, decimal), [decimal, unlockableAmount]);
  const remove = api.tx.convictionVoting.removeVote; // (class, index)
  const unlockClass = api.tx.convictionVoting.unlock; // (class)
  const batchAll = api.tx.utility.batchAll;

  useEffect((): void => {
    if (!formatted) {
      return;
    }

    const removes = classToUnlock.map((r) => isBn(r.refId) ? remove(r.classId, r.refId) : undefined).filter((i) => !!i);
    const uniqueSet = new Set<string>();

    classToUnlock.forEach(({ classId }) => {
      const id = classId.toString();

      uniqueSet.add(id);
    });

    const unlocks = [...uniqueSet].map((id) => unlockClass(id, formatted));

    const params = [...removes, ...unlocks];

    setParams(params);

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    batchAll(params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, batchAll, formatted, classToUnlock, remove, unlockClass]);

  const goToAccount = useCallback(() => {
    setShow(false);

    onAction(`/account/${address}`);
  }, [address, onAction, setShow]);

  const goToHome = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const unlockRef = useCallback(async () => {
    try {
      if (!formatted || !params) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const extrinsic = batchAll(params);
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
        subAction: 'Unlock',
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
  }, [formatted, params, selectedProxyAddress, password, batchAll, selectedProxy, api, amount, estimatedFee, name, selectedProxyName, chain]);

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
          text={t<string>('Unlocking')}
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
            label={t('Available to unlock')}
            showDivider={!totalLocked.sub(unlockableAmount).isZero()}
            token={token}
            withFee
          />
          {!totalLocked.sub(unlockableAmount).isZero() &&
            <Warning
              theme={theme}
            >
              {t<string>('The rest will be available when the corresponding locks have expired.')}
            </Warning>
          }
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
          onChange={setPassword}
          onConfirmClick={unlockRef}
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
      </Popup>
      <WaitScreen
        show={showWaitScreen}
        title={t('Staking')}
      />
      {txInfo && (
        <Confirmation
          address={address}
          onPrimaryBtnClick={goToAccount}
          onSecondaryBtnClick={goToHome}
          primaryBtnText={t('My Account')}
          secondaryBtnText={t('Home')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        />)
      }
    </Motion>
  );
}
