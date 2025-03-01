// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple } from '@polkadot/types/types';
import type { MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, ShowBalance2, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useDecimal, useProxies, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import broadcast from '../../../../util/api/broadcast';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToMachine, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  show: boolean;
  formatted: string;
  api: ApiPromise;
  amount: string;
  chain: Chain | null;
  estimatedFee: Balance | undefined;
  unlockingLen: number;
  maxUnlockingChunks: number
  unbonded: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  poolWithdrawUnbonded: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  redeemDate: string | undefined;
  total: BN | undefined;
  unstakeAllAmount?: boolean;
  pool: MyPoolInfo
}

export default function Review({ address, amount, api, chain, estimatedFee, formatted, maxUnlockingChunks, pool, poolWithdrawUnbonded, redeemDate, setShow, show, total, unbonded, unlockingLen, unstakeAllAmount }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
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

  const poolId = pool.poolId;

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/pool/${address}`);
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
      if (!formatted || !unbonded || !poolWithdrawUnbonded || !decimal || (!pool?.member?.points && unstakeAllAmount)) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);
      const amountAsBN = unstakeAllAmount
        ? new BN(pool.member?.points ?? BN_ZERO)
        : amountToMachine(amount, decimal);
      const params = [formatted, amountAsBN];

      if (unlockingLen < maxUnlockingChunks) {
        const { block, failureText, fee, success, txHash } = await broadcast(api, unbonded, params, signer, formatted, selectedProxy);

        const info = {
          action: 'Pool Staking',
          amount,
          block,
          date: Date.now(),
          failureText,
          fee: fee || String(estimatedFee || 0),
          from: { address: formatted, name },
          subAction: 'Unstake',
          success,
          throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
          txHash
        };

        saveAsHistory(from, info);
        setTxInfo({ ...info, api, chain: chain as any });
      } else { // hence a poolWithdrawUnbonded is needed
        const optSpans = await api.query['staking']['slashingSpans'](formatted) as any;
        const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1;

        const batch = api.tx['utility']['batchAll']([
          poolWithdrawUnbonded(poolId, spanCount),
          unbonded(...params)
        ]);

        const tx = selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, batch) : batch;
        const { block, failureText, fee, success, txHash } = await signAndSend(api, tx, signer, formatted);

        const info = {
          action: 'Pool Staking',
          amount,
          block,
          date: Date.now(),
          failureText,
          fee: fee || String(estimatedFee || 0),
          from: { address: formatted, name },
          subAction: 'Unstake',
          success,
          throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
          txHash
        };

        saveAsHistory(from, info);
        setTxInfo({ ...info, api, chain: chain as any });
      }

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [amount, api, chain, decimal, estimatedFee, formatted, maxUnlockingChunks, name, password, pool?.member?.points, poolId, poolWithdrawUnbonded, selectedProxy, selectedProxyAddress, selectedProxyName, unbonded, unlockingLen, unstakeAllAmount]);

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
          text={t<string>('Unstaking')}
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
              {t('This amount will be redeemable on {{redeemDate}}, and your rewards will be automatically claimed.', { replace: { redeemDate } })}
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
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={unstake}
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
