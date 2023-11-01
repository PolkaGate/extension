// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens withdraw rewards review page
 * */

import type { ApiPromise } from '@polkadot/api';

import { Container } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, AmountFee, FormatBalance, Motion, PasswordUseProxyConfirm, Popup, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useProxies, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import broadcast from '../../../../util/api/broadcast';
import { STAKING_CHAINS } from '../../../../util/constants';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import TxDetail from '../rewards/partials/TxDetail';

interface Props {
  address: string;
  show: boolean;
  formatted: string;
  api: ApiPromise;
  amount: BN;
  chain: Chain;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  available: BN;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function RedeemableWithdrawReview ({ address, amount, api, available, chain, formatted, setRefresh, setShow, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
  const name = useAccountDisplay(address);
  const onAction = useContext(ActionContext);

  useUnSupportedNetwork(address, STAKING_CHAINS);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const tx = api.tx.nominationPools.withdrawUnbonded;

  const decimal = api.registry.chainDecimals[0];

  const goToStakingHome = useCallback(() => {
    setShow(false);
    setRefresh(true);

    onAction(`/pool/${address}`);
  }, [address, onAction, setRefresh, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect((): void => {
    if (!api) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const params = [formatted, 100];/** 100 is a dummy spanCount */

    tx(...params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [tx, formatted, api]);

  const submit = useCallback(async () => {
    try {
      if (!formatted) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);
      const optSpans = await api.query.staking.slashingSpans(formatted);
      const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1;
      const params = [formatted, spanCount];
      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Pool Staking',
        amount: amountToHuman(amount, decimal),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Redeem',
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
  }, [api, formatted, selectedProxyAddress, password, tx, selectedProxy, amount, decimal, estimatedFee, name, selectedProxyName, chain]);

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
          text={t<string>('Withdraw Redeemable')}
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
          />
          <AmountFee
            address={address}
            amount={
              <FormatBalance
                api={api}
                value={amount}
              />
            }
            fee={estimatedFee}
            label={t('Withdraw amount')}
            showDivider
            style={{ pt: '5px' }}
            withFee
          />
          <AmountFee
            address={address}
            amount={
              <FormatBalance
                api={api}
                value={amount.add(available).sub(estimatedFee ?? BN_ZERO)}
              />
            }
            label={t('Available balance after')}
            style={{ pt: '5px' }}
          />
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={submit}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
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
          title={t('Withdraw Redeemable')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Withdraw Redeemable')}
            onPrimaryBtnClick={goToStakingHome}
            primaryBtnText={t('Staking Home')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail
              label={t<string>('Withdrawn amount')}
              txInfo={txInfo}
            />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
