// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component opens unstake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { AnyTuple } from '@polkadot/types/types';

import { Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, AmountFee, FormatBalance, Motion, PasswordUseProxyConfirm, Popup, Warning } from '../../../../components';
import { useAccountName, useProxies, useTranslation } from '../../../../hooks';
import { updateMeta } from '../../../../messaging';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import broadcast from '../../../../util/api/broadcast';
import { Proxy, ProxyItem, TransactionDetail, TxInfo } from '../../../../util/types';
import { amountToMachine, getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../util/utils';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  amount: string;
  api: ApiPromise;
  chain: Chain;
  estimatedFee: Balance | undefined;
  formatted: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  total: BN | undefined;
  unlockingAmount: BN;
  rebonded: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
}

export default function Review({ address, amount, api, chain, estimatedFee, formatted, rebonded, setShow, show, total }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
  const name = useAccountName(address);
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const decimal = api?.registry?.chainDecimals[0] ?? 1;
  const token = api?.registry?.chainTokens[0] ?? '';
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

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

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
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
    const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    try {
      if (!formatted || !rebonded) {
        return;
      }

      const signer = keyring.getPair(selectedProxyAddress ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);
      const amountAsBN = amountToMachine(amount, decimal);
      const params = [amountAsBN];
      const { block, failureText, fee, status, txHash } = await broadcast(api, rebonded, params, signer, formatted, selectedProxy);

      const info = {
        action: 'solo_rebond',
        amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        status,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      history.push(info);
      setTxInfo({ ...info, api, chain });

      saveHistory(chain, hierarchy, formatted, history);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [amount, api, chain, decimal, estimatedFee, formatted, hierarchy, name, password, rebonded, selectedProxy, selectedProxyAddress, selectedProxyName]);

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
          text={t<string>('Restaking')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <Grid color='red' height='30px' m='auto' mt='-10px' width='92%'>
            <Warning fontWeight={400} isBelowInput isDanger theme={theme}>
              {t<string>('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
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
            amount={amount}
            fee={estimatedFee}
            label={t('Amount')}
            showDivider
            style={{ pt: '5px' }}
            token={token}
            withFee
          />
          <AmountFee
            address={address}
            amount={
              <FormatBalance
                api={api}
                value={total}
              />
            }
            label={t('Total stake after')}
            style={{ pt: '5px' }}
          />
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={unstake}
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
        <WaitScreen
          show={showWaitScreen}
          title={t('Restaking')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Restaking')}
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
