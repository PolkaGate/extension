// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens bondExtra review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, AmountFee, FormatBalance, PasswordUseProxyConfirm, PButton, Popup, Warning } from '../../../../../components';
import { useAccountName, useChain, useFormatted, useProxies, useTranslation } from '../../../../../hooks';
import { updateMeta } from '../../../../../messaging';
import { Confirmation, HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import { broadcast } from '../../../../../util/api';
import { MyPoolInfo, Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../../util/types';
import { amountToHuman, getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../../util/utils';
import BondExtraTxDetail from './partial/BondExtraTxDetail';

interface Props {
  api: ApiPromise;
  address: string;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  bondAmount?: BN;
  estimatedFee?: Balance;
  pool: MyPoolInfo;
}

export default function Review({ address, api, bondAmount, estimatedFee, pool, setShowReview, showReview }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
  const formatted = useFormatted(address);
  const name = useAccountName(address);
  const proxies = useProxies(api, address);
  const decimals = api.registry.chainDecimals[0];

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);
  const totalStaked = (new BN(pool.member.points).mul(new BN(pool.stashIdAccount.stakingLedger.active))).div(new BN(pool.bondedPool.points));
  const bondExtra = api.tx.nominationPools.bondExtra;

  const _onBackClick = useCallback(() => {
    setShowReview(!showReview);
  }, [setShowReview, showReview]);

  const goToStakingHome = useCallback(() => {
    setShowReview(!showReview);
    onAction(`pool/stake/${address}`);
  }, [address, onAction, setShowReview, showReview]);

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

  const BondExtra = useCallback(async () => {
    if (!formatted || !bondExtra) {
      return;
    }

    try {
      const signer = keyring.getPair(selectedProxy?.delegate ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      const params = [{ FreeBalance: bondAmount }];

      const { block, failureText, fee, status, txHash } = await broadcast(api, bondExtra, params, signer, address, selectedProxy);

      const info = {
        action: 'pool_bondExtra',
        amount: amountToHuman(bondAmount?.toString(), decimals),
        block,
        chain,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee),
        from: { address: formatted, name },
        status,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveHistory(chain, hierarchy, formatted, [info]);
      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [address, api, bondAmount, bondExtra, chain, decimals, estimatedFee, formatted, hierarchy, name, password, selectedProxy, selectedProxyAddress, selectedProxyName]);

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
          showClose
          text={t<string>('Staking')}
        />
        {isPasswordError &&
          <Grid color='red' height='30px' m='auto' mt='-10px' width='92%'>
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
          style={{ m: 'auto', width: '90%' }
          }
        />
        <AmountFee
          address={address}
          amount={
            <FormatBalance
              api={api}
              value={bondAmount}
            />
          }
          fee={estimatedFee}
          label={t('Amount')}
          showDivider
          style={{ pt: '5px' }}
          withFee
        />
        <Typography fontSize='16px' fontWeight={300} lineHeight='25px' textAlign='center'>
          {t<string>('Pool')}
        </Typography>
        <Grid fontSize='18px' fontWeight={400} textAlign='center' maxWidth='90%' m='auto' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
          {pool?.metadata}
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
        <AmountFee
          address={address}
          amount={
            <FormatBalance
              api={api}
              value={bondAmount?.add(totalStaked)}
            />
          }
          label={t('Total stake after')}
          style={{ pt: '2px' }}
        />
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={BondExtra}
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
        title={t('Staking')}
      />
      {
        txInfo &&
        <Confirmation
          headerTitle={t('Pool Staking')}
          onPrimaryBtnClick={goToStakingHome}
          primaryBtnText={t('Staking Home')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <BondExtraTxDetail pool={pool} txInfo={txInfo} />
        </Confirmation>
      }
    </>
  );
}
