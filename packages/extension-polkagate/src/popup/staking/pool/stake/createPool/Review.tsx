// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens create pool review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountHolderWithProxy, ActionContext, FormatBalance, PasswordUseProxyConfirm, Popup, WrongPasswordAlert } from '../../../../../components';
import { useAccountDisplay, useChain, useDecimal, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { Confirmation, HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import { createPool } from '../../../../../util/api';
import { PoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { amountToHuman, getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import ShowPool from '../../../partial/ShowPool';
import CreatePoolTxDetail from './partial/CreatePoolTxDetail';

interface Props {
  api: ApiPromise;
  address: string;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  createAmount: BN;
  estimatedFee?: Balance;
  poolToCreate: PoolInfo;
}

export default function Review({ address, api, createAmount, estimatedFee, poolToCreate, setShowReview, showReview = false }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chain = useChain(address);
  const onAction = useContext(ActionContext);
  const formatted = useFormatted(address);
  const name = useAccountDisplay(address);
  const proxies = useProxies(api, address);
  const decimal = useDecimal(address);

  const create = api.tx.nominationPools.create;

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
    setShowReview(false);
  }, [setShowReview]);

  const goToMyAccounts = useCallback(() => {
    onAction(`/pool/nominations/${address}`);
  }, [address, onAction]);

  const goToStakingHome = useCallback(() => {
    onAction(`pool/${address}`);
  }, [address, onAction]);

  useEffect(() => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const goCreatePool = useCallback(async () => {
    if (!formatted || !create) {
      return;
    }

    try {
      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      // const params = [surAmount, rootId, nominatorId, stateTogglerId];
      const nextPoolId = poolToCreate.poolId;

      const { block, failureText, fee, success, txHash } = await createPool(api, address, signer, createAmount, nextPoolId, poolToCreate.bondedPool?.roles, poolToCreate.metadata ?? '', selectedProxy);

      const info = {
        action: 'Pool Staking',
        amount: amountToHuman(createAmount?.toString(), decimal),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Create Pool',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null,
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
  }, [address, api, chain, create, createAmount, decimal, estimatedFee, formatted, name, password, poolToCreate.bondedPool?.roles, poolToCreate.metadata, poolToCreate.poolId, selectedProxy, selectedProxyAddress, selectedProxyName]);

  return (
    <>
      <Popup show={showReview}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Create Pool')}
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
          address={formatted}
          chain={chain}
          selectedProxyAddress={selectedProxyAddress}
          showDivider
          style={{ m: 'auto', width: '90%' }}
          title={t('Depositor')}
        />
        <Grid container justifyContent='center' pt='5px'>
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
          mode='Creating'
          pool={poolToCreate}
          showInfo
          style={{
            m: '8px auto 0',
            width: '92%'
          }}
        />
        <Typography fontSize='12px' fontWeight={300} sx={{ m: '5px auto 0', width: '90%' }}>
          {t<string>('* 0.0100 WND will be bonded in Reward Id, and will be returned back when unbound all.')}
        </Typography>
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={goCreatePool}
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
        title={t('Create Pool')}
      />
      {txInfo && (
        <Confirmation
          headerTitle={t('Create Pool')}
          onPrimaryBtnClick={goToMyAccounts}
          onSecondaryBtnClick={goToStakingHome}
          primaryBtnText={t<string>('Select Validators')}
          secondaryBtnText={t<string>('Staking Home')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <CreatePoolTxDetail pool={poolToCreate} txInfo={txInfo} />
        </Confirmation>)
      }
    </>
  );
}
