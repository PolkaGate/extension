// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake rewards review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Container } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, ShowBalance2, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useEstimatedFee, useProxies, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import broadcast from '../../../../util/api/broadcast';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  show: boolean;
  formatted: string;
  api: ApiPromise;
  amount: BN;
  chain: Chain;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  staked: BN;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RewardsStakeReview({ address, amount, api, chain, formatted, setRefresh, setShow, show, staked }: Props): React.ReactElement {
  const { t } = useTranslation();
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
  const tx = api.tx['nominationPools']['bondExtra'];
  const params = useMemo(() => ['Rewards'], []);
  const decimal = api.registry.chainDecimals[0];

  const estimatedFee = useEstimatedFee(address, tx, params);

  const goToStakingHome = useCallback(() => {
    setShow(false);
    setRefresh(true);
    onAction(`/pool/${address}`);
  }, [address, onAction, setRefresh, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const submit = useCallback(async () => {
    try {
      if (!formatted) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Pool Staking',
        amount: amountToHuman(amount, decimal),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Stake Rewards',
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
  }, [api, tx, chain, amount, decimal, estimatedFee, formatted, name, params, password, selectedProxy, selectedProxyAddress, selectedProxyName]);

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
          text={t<string>('Stake Rewards')}
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
            amount={<ShowBalance2 address={address} balance={amount} />}
            fee={estimatedFee}
            label={t('Amount')}
            showDivider
            style={{ pt: '5px' }}
            withFee
          />
          <AmountFee
            address={address}
            amount={<ShowBalance2 address={address} balance={amount.add(staked)} />}
            label={t('Total stake after')}
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
          proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
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
          title={t('Stake Rewards')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Stake Rewards')}
            onPrimaryBtnClick={goToStakingHome}
            primaryBtnText={t('Staking Home')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail
              label={t<string>('Staked')}
              txInfo={txInfo}
            />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
