// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens join pool review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, ChainLogo, FormatBalance, PasswordUseProxyConfirm, Popup, WrongPasswordAlert } from '../../../../../components';
import { useAccountDisplay, useChain, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { Confirmation, HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import { broadcast } from '../../../../../util/api';
import { PoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import ShowPool from '../../../partial/ShowPool';
import JoinPoolTxDetail from './partials/JoinPoolTxDetail';

interface Props {
  api: ApiPromise;
  address: string;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  joinAmount?: BN;
  estimatedFee?: Balance;
  poolToJoin: PoolInfo;
}

export default function Review({ address, api, estimatedFee, joinAmount, poolToJoin, setShowReview, showReview = false }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chain = useChain(address);
  const onAction = useContext(ActionContext);
  const formatted = useFormatted(address);
  const name = useAccountDisplay(address);
  const proxies = useProxies(api, address);
  const decimals = api.registry.chainDecimals[0];

  const joined = api.tx.nominationPools.join; // (amount, poolId)

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

  const goToStakingHome = useCallback(() => {
    onAction(`/pool/${address}`);
  }, [address, onAction]);

  const joinPool = useCallback(async () => {
    if (!poolToJoin || !formatted || !joined) {
      return;
    }

    try {
      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const params = [joinAmount, poolToJoin.poolId];

      const { block, failureText, fee, success, txHash } = await broadcast(api, joined, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Pool Staking',
        amount: amountToHuman(joinAmount?.toString(), decimals),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(from), name: selectedProxyName || name },
        subAction: 'Join Pool',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(String(from), info);
      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, decimals, estimatedFee, formatted, joinAmount, joined, name, password, poolToJoin, selectedProxy, selectedProxyAddress, selectedProxyName]);

  useEffect(() => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  return (
    <>
      <Popup show={showReview}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          text={t<string>('Join Pool')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t<string>('Review')} />
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          selectedProxyAddress={selectedProxyAddress}
          showDivider
          style={{ m: 'auto', width: '90%' }}
        />
        <Typography fontSize='16px' fontWeight={300} textAlign='center'>
          {t<string>('Amount')}
        </Typography>
        <Grid alignItems='center' container item justifyContent='center' >
          <Grid item>
            <ChainLogo genesisHash={chain?.genesisHash} />
          </Grid>
          <Grid item sx={{ fontSize: '26px', pl: '8px' }}>
            <FormatBalance api={api} decimalPoint={4} value={joinAmount} />
          </Grid>
        </Grid>
        <Grid container justifyContent='center'>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t<string>('Fee:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <FormatBalance api={api} decimalPoint={4} value={estimatedFee} />
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
        <ShowPool
          api={api}
          chain={chain}
          label={t<string>('Pool')}
          labelPosition='center'
          mode='Joining'
          pool={poolToJoin}
          showInfo
          style={{
            m: '8px auto 0',
            width: '92%'
          }}
        />
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={joinPool}
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
      </Popup>
      <WaitScreen
        show={showWaitScreen}
        title={t('Join Pool')}
      />
      {txInfo && (
        <Confirmation
          headerTitle={t('Join Pool')}
          onPrimaryBtnClick={goToStakingHome}
          primaryBtnText={t('Staking Home')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <JoinPoolTxDetail
            pool={poolToJoin}
            txInfo={txInfo}
          />
        </Confirmation>)
      }
    </>
  );
}
