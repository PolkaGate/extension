// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { Proxy, ProxyItem, TxInfo } from '../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { ActionContext, CanPayErrorAlert, PasswordUseProxyConfirm, ProxyTable, ShowBalance, WrongPasswordAlert } from '../../components';
import { useAccount, useAccountDisplay, useCanPayFeeAndDeposit, useEstimatedFee } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { SubTitle, WaitScreen } from '../../partials';
import Confirmation from '../../partials/Confirmation';
import { signAndSend } from '../../util/api';
import { PROXY_TYPE } from '../../util/constants';
import { getFormattedAddress, getSubstrateAddress, saveAsHistory } from '../../util/utils';
import ManageProxiesTxDetail from './partials/ManageProxiesTxDetail';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  depositValue: BN;
  proxies: ProxyItem[];
  depositToPay: BN | undefined;
}

export default function Review({ address, api, chain, depositToPay, depositValue, proxies }: Props): React.ReactElement {
  const { t } = useTranslation();
  const name = useAccountDisplay(address);
  const account = useAccount(address);
  const onAction = useContext(ActionContext);

  const [helperText, setHelperText] = useState<string | undefined>();
  const [proxiesToChange, setProxiesToChange] = useState<ProxyItem[] | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const formatted = getFormattedAddress(address, undefined, chain.ss58Format);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const removeProxy = api.tx['proxy']['removeProxy']; /** (delegate, proxyType, delay) **/
  const addProxy = api.tx['proxy']['addProxy']; /** (delegate, proxyType, delay) **/
  const batchAll = api.tx['utility']['batchAll'];

  const goToMyAccounts = useCallback(() => {
    setShowConfirmation(false);
    setShowWaitScreen(false);
    onAction('/');
  }, [onAction]);

  const calls = useMemo((): SubmittableExtrinsic<'promise'>[] => {
    const temp: SubmittableExtrinsic<'promise'>[] = [];

    proxiesToChange?.forEach((item: ProxyItem) => {
      const p = item.proxy;

      item.status === 'remove' && temp.push(removeProxy(p.delegate, p.proxyType, p.delay));
      item.status === 'new' && temp.push(addProxy(p.delegate, p.proxyType, p.delay));
    });

    return temp;
  }, [addProxy, proxiesToChange, removeProxy]);

  const tx = useMemo(() => calls.length !== 0 && calls.length > 1 ? batchAll(calls) : calls[0], [batchAll, calls]);
  const estimatedFee = useEstimatedFee(address, tx);
  const canPayFeeAndDeposit = useCanPayFeeAndDeposit(formatted?.toString(), selectedProxy?.delegate, estimatedFee, depositToPay);

  const onNext = useCallback(async (): Promise<void> => {
    try {
      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const decidedTx = selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, tx) : tx;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, decidedTx, signer, selectedProxy?.delegate ?? formatted);

      const info = {
        action: 'Manage Proxy',
        block: block || 0,
        chain,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Add/Remove Proxy',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain: chain as any });

      saveAsHistory(from, info);
      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  useEffect(() => {
    const addingLength = proxies.filter((item) => item.status === 'new').length;
    const removingLength = proxies.filter((item) => item.status === 'remove').length;

    addingLength && setHelperText(t<string>('You are adding {{addingLength}} Prox{{iesOrY}}', { replace: { addingLength, iesOrY: addingLength > 1 ? 'ies' : 'y' } }));
    removingLength && setHelperText(t<string>('You are removing {{removingLength}} Prox{{iesOrY}}', { replace: { iesOrY: removingLength > 1 ? 'ies' : 'y', removingLength } }));
    addingLength && removingLength && setHelperText(t<string>('Adding {{addingLength}} and removing {{removingLength}} Proxies', { replace: { addingLength, removingLength } }));
  }, [proxies, t]);

  useEffect(() => {
    const toChange = proxies.filter((item) => item.status === 'remove' || item.status === 'new');

    setProxiesToChange(toChange);
  }, [proxies]);

  return (
    <>
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      {canPayFeeAndDeposit.isAbleToPay === false &&
        <CanPayErrorAlert canPayStatements={canPayFeeAndDeposit.statement} />
      }
      <Grid container my='20px'>
        <SubTitle label={t<string>('Review')} />
      </Grid>
      <Typography textAlign='center'>
        {helperText}
      </Typography>
      <ProxyTable
        chain={chain as any}
        label={t<string>('Proxies')}
        maxHeight={window.innerHeight / 3}
        mode='Status'
        proxies={proxiesToChange}
        style={{
          m: '20px auto 10px',
          width: '92%'
        }}
      />
      <Grid alignItems='center' container justifyContent='center' m='20px auto 5px' width='92%'>
        <Grid display='inline-flex' item>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t<string>('Deposit:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={depositValue}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Divider orientation='vertical' sx={{ backgroundColor: 'secondary.main', height: '30px', mx: '5px', my: 'auto' }} />
        <Grid display='inline-flex' item >
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t<string>('Fee:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={estimatedFee}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
      </Grid>
      <PasswordUseProxyConfirm
        api={api}
        // estimatedFee={estimatedFee}
        disabled={canPayFeeAndDeposit.isAbleToPay !== true}
        genesisHash={account?.genesisHash as string}
        isPasswordError={isPasswordError}
        label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
        onChange={setPassword}
        onConfirmClick={onNext}
        proxiedAddress={address}
        proxies={proxies}
        proxyTypeFilter={PROXY_TYPE.GENERAL}
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
      {
        <WaitScreen
          show={showWaitScreen}
          title={t('Manage Proxies')}
        />
      }
      {txInfo &&
        <Confirmation
          headerTitle={t<string>('Manage Proxies')}
          onPrimaryBtnClick={goToMyAccounts}
          primaryBtnText={t<string>('My accounts')}
          showConfirmation={showConfirmation}
          txInfo={txInfo}
        >
          <ManageProxiesTxDetail
            address={selectedProxyAddress}
            api={api}
            chain={chain as any}
            deposit={depositValue}
            proxies={proxiesToChange as ProxyItem[]}
          />
        </Confirmation>
      }
    </>
  );
}
