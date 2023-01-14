// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens create pool review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, ActionContext, FormatBalance, PasswordUseProxyConfirm, Popup, Warning } from '../../../../../components';
import { useAccountName, useChain, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { Confirmation, HeaderBrand, SubTitle, ThroughProxy, WaitScreen } from '../../../../../partials';
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
  const theme = useTheme();
  const chain = useChain(address);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const formatted = useFormatted(address);
  const name = useAccountName(address);
  const proxies = useProxies(api, address);
  const decimals = api.registry.chainDecimals[0];

  const create = api.tx.nominationPools.create;

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

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
      const nextPoolId = poolToCreate.poolId.toNumber();

      const { block, failureText, fee, success, txHash } = await createPool(api, address, signer, createAmount, nextPoolId, poolToCreate.bondedPool?.roles, poolToCreate.metadata ?? '', selectedProxy);

      const info = {
        action: 'Pool Staking',
        amount: amountToHuman(createAmount?.toString(), decimals),
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: from, name: selectedProxyName || name },
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
  }, [address, api, chain, create, createAmount, decimals, estimatedFee, formatted, name, password, poolToCreate.bondedPool?.roles, poolToCreate.metadata, poolToCreate.poolId, selectedProxy, selectedProxyAddress, selectedProxyName]);

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
          <Grid
            color='red'
            height='30px'
            m='auto'
            mt='-10px'
            width='92%'
          >
            <Warning
              fontWeight={400}
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
        }
        <SubTitle
          label={t<string>('Review')}
          withSteps={{ current: 2, total: 2 }}
        />
        {/* <AccountHolderWithProxy address={formatted} selectedProxyAddress={selectedProxyAddress} showDivider style={{ m: 'auto', width: '90%' }} /> */}
        {selectedProxyAddress &&
          <>
            <ThroughProxy
              address={selectedProxyAddress}
              style={{
                pt: '10px'
              }}
            />
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
          </>
        }
        <Grid
          container
          justifyContent='center'
          pt='5px'
        >
          <Typography
            fontSize='14px'
            fontWeight={300}
            lineHeight='23px'
          >
            {t<string>('Fee:')}
          </Typography>
          <Grid
            item
            lineHeight='22px'
            pl='5px'
          >
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
        <Typography
          fontSize='12px'
          fontWeight={300}
          sx={{
            m: '20px auto 0',
            width: '90%'
          }}
        >
          {t<string>('* 0.0100 WND will be bonded in Reward Id, and will be returned back when unbound all.')}
        </Typography>
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={goCreatePool}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer']}
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
          primaryBtnText={t<string>('Select Validators')}
          secondaryBtnText={t<string>('Staking Home')}
          onSecondaryBtnClick={goToStakingHome}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <CreatePoolTxDetail pool={poolToCreate} txInfo={txInfo} />
        </Confirmation>)
      }
    </>
  );
}
