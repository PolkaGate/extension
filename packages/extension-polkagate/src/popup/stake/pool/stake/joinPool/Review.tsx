// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens join pool review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, ChainLogo, FormatBalance, PasswordUseProxyConfirm, PButton, Popup, Warning } from '../../../../../components';
import { useAccountName, useChain, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { updateMeta } from '../../../../../messaging';
import { Confirmation, HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import { broadcast } from '../../../../../util/api';
import { PoolInfo, Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../../util/types';
import { amountToHuman, getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../../util/utils';
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
  const theme = useTheme();
  const chain = useChain(address);
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
  const formatted = useFormatted(address);
  const name = useAccountName(address);
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
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

  const goToMyAccounts = useCallback(() => {
    onAction('/');
  }, [onAction]);

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

  const joinPool = useCallback(async () => {
    const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    if (!formatted || !joined) {
      return;
    }

    try {
      const signer = keyring.getPair(selectedProxy?.delegate ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      const params = [joinAmount, poolToJoin.poolId];

      const { block, failureText, status, txHash } = await broadcast(api, joined, params, signer, formatted, selectedProxy);

      const info = {
        action: 'pool_join',
        amount: amountToHuman(joinAmount?.toString(), decimals),
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
  }, [api, chain, decimals, estimatedFee, formatted, hierarchy, joinAmount, joined, name, password, poolToJoin.poolId, selectedProxy, selectedProxyAddress, selectedProxyName]);

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
        />
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          selectedProxyAddress={selectedProxyAddress}
          showDivider
          style={{ m: 'auto', width: '90%' }}
        />
        <Typography
          fontSize='16px'
          fontWeight={300}
          textAlign='center'
        >
          {t<string>('Amount')}
        </Typography>
        <Grid alignItems='center' container item justifyContent='center' >
          <Grid item>
            <ChainLogo genesisHash={chain?.genesisHash} />
          </Grid>
          <Grid item sx={{ fontSize: '26px', pl: '8px' }}>
            <FormatBalance api={api} decimalPoint={2} value={joinAmount} />
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent='center'
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
          mode='Joining'
          pool={poolToJoin}
          style={{
            m: '8px auto 0',
            width: '92%'
          }}
        />
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={joinPool}
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
        title={t('Join Pool')}
      />
      {txInfo && (
        <Confirmation
          headerTitle={t('Join Pool')}
          onPrimaryBtnClick={goToMyAccounts}
          primaryBtnText={t('My accounts')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <JoinPoolTxDetail pool={poolToJoin} txInfo={txInfo} />
        </Confirmation>)
      }
    </>
  );
}
