// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens create pool review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, FormatBalance, PasswordUseProxyConfirm, PButton, Popup, Warning } from '../../../../../components';
import { useAccountName, useChain, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { updateMeta } from '../../../../../messaging';
import { Confirmation, HeaderBrand, SubTitle, ThroughProxy, WaitScreen } from '../../../../../partials';
import { createPool } from '../../../../../util/api';
import { PoolInfo, Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../../util/types';
import { amountToHuman, getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../../util/utils';
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
  const { accounts, hierarchy } = useContext(AccountContext);
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

  const goToMyAccounts = useCallback(() => { //TODO ADD SELECT VALIDATORS URL
    onAction('/');
  }, [onAction]);

  const goToStakingHome = useCallback(() => {
    onAction(`pool/stake/${address}`);
  }, [address, onAction]);

  function saveHistory(chain: Chain, hierarchy: AccountWithChildren[], address: string, history: TransactionDetail[]) {
    if (!history.length) {
      return;
    }

    const accountSubstrateAddress = getSubstrateAddress(address);

    if (!accountSubstrateAddress) {
      return; // should not happen !
    }

    const savedHistory: TransactionDetail[] = getTransactionHistoryFromLocalStorage(chain, hierarchy, accountSubstrateAddress);

    savedHistory.push(...history);

    updateMeta(accountSubstrateAddress, prepareMetaData(chain, 'history', savedHistory)).catch(console.error);
  }

  useEffect(() => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const goCreatePool = useCallback(async () => {
    const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    if (!formatted || !create) {
      return;
    }

    try {
      const signer = keyring.getPair(selectedProxy?.delegate ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      // const params = [surAmount, rootId, nominatorId, stateTogglerId];
      const nextPoolId = poolToCreate.poolId.toNumber();

      const { block, failureText, fee, status, txHash } = await createPool(api, address, signer, createAmount, nextPoolId, poolToCreate.bondedPool?.roles, poolToCreate.metadata ?? '', selectedProxy);

      const info = {
        action: 'pool_create',
        amount: amountToHuman(createAmount?.toString(), decimals),
        block,
        date: Date.now(),
        failureText,
        fee: estimatedFee,
        from: { address: formatted, name },
        txHash,
        status,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null
      };

      history.push(info);
      setTxInfo({ ...info, api, chain });

      // eslint-disable-next-line no-void
      void saveHistory(chain, hierarchy, formatted, history);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [address, api, chain, create, createAmount, decimals, estimatedFee, formatted, hierarchy, name, password, poolToCreate.bondedPool?.roles, poolToCreate.metadata, poolToCreate.poolId, selectedProxy, selectedProxyAddress, selectedProxyName]);

  return (
    <>
      <Popup show={showReview}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Create Pool')}
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
          label={t<string>('Pool')}
          labelPosition='center'
          mode='Creating'
          pool={poolToCreate}
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
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={['Any']}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setSelectedProxy={setSelectedProxy}
          style={{
            bottom: '80px',
            left: '4%',
            position: 'absolute',
            width: '92%'
          }}
          onConfirmClick={goCreatePool}
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
