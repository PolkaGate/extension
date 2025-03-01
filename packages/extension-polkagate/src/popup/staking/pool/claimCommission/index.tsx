// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens withdraw rewards review page
 * */

import type { MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Container } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, AmountFee, Motion, PasswordUseProxyConfirm, Popup, ShowBalance2, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import broadcast from '../../../../util/api/broadcast';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import { To } from '../../../send/Review';
import TxDetail from '../rewards/partials/TxDetail';

interface Props {
  address: string;
  show: boolean;
  pool: MyPoolInfo;
  setShow: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function ClaimCommission({ address, pool, setShow, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { api, chain, decimal, formatted } = useInfo(address);
  const proxies = useProxies(api, formatted);
  const name = useAccountDisplay(address);
  const onAction = useContext(ActionContext);

  const poolId = pool.poolId;
  const amount = useMemo(() => new BN(pool.rewardPool?.totalCommissionPending || 0), [pool.rewardPool?.totalCommissionPending]);
  //@ts-ignore
  const payee = pool.bondedPool?.commission?.current?.[1]?.toString() as string | undefined;

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const tx = api?.tx['nominationPools']['claimCommission'];
  const estimatedFee = useEstimatedFee(address, tx, [poolId]);

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/pool/${address}`);
  }, [address, onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const submit = useCallback(async () => {
    try {
      if (!formatted || !api || !tx) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);
      const params = [poolId];

      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Pool Claim Commission',
        amount: amountToHuman(amount, decimal),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(from), name },
        subAction: 'Claim',
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
  }, [formatted, selectedProxyAddress, password, poolId, api, tx, selectedProxy, amount, decimal, estimatedFee, name, selectedProxyName, chain]);

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
          text={t('Withdraw Commission')}
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
            amount={<ShowBalance2 address={address} balance={amount} />}
            fee={estimatedFee}
            label={t('Claimable amount')}
            showDivider
            style={{ pt: '5px' }}
            withFee
          />
          <To
            chain={chain as any}
            formatted={payee}
            label={t('Payee')}
            noDivider
            pt1={0}
            pt2={0}
          />
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          confirmDisabled={!api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
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
          title={t('Withdraw Commission')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Withdraw Commission')}
            onPrimaryBtnClick={goToStakingHome}
            primaryBtnText={t('Staking Home')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail
              label={t('Withdrawn amount')}
              txInfo={txInfo}
            />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
