// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, ActionContext, PasswordWithUseProxy, PButton, ProxyTable, ShowBalance, Warning } from '../../components';
import { useAccount } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { WaitScreen } from '../../partials';
import Confirmation from '../../partials/Confirmation';
import { signAndSend } from '../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { getFormattedAddress, getSubstrateAddress } from '../../util/utils';
import ManageProxiesTxDetail from './partials/ManageProxiesTxDetail';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  depositValue: BN;
  proxies: ProxyItem[];
}

export default function Review({ address, api, chain, depositValue, proxies }: Props): React.ReactElement {
  const [helperText, setHelperText] = useState<string | undefined>();
  const [proxiesToChange, setProxiesToChange] = useState<ProxyItem[] | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [nextButtonDisabe, setNextButtonDisalbe] = useState<boolean>(true);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  const theme = useTheme();
  const { t } = useTranslation();
  const account = useAccount(address);
  const formatted = getFormattedAddress(address, undefined, chain.ss58Format);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const removeProxy = api.tx.proxy.removeProxy; /** (delegate, proxyType, delay) **/
  const addProxy = api.tx.proxy.addProxy; /** (delegate, proxyType, delay) **/
  const batchAll = api.tx.utility.batchAll;

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

  useEffect(() => {
    if (!tx) { return; }

    // eslint-disable-next-line no-void
    void tx.paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [formatted, tx]);

  const onNext = useCallback(async (): Promise<void> => {
    // const localState = state;
    // const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    try {
      const signer = keyring.getPair(selectedProxy?.delegate ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      const decidedTx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;

      const { block, failureText, fee, status, txHash } = await signAndSend(api, decidedTx, signer, selectedProxy?.delegate ?? formatted);

      // history.push({
      //   action: 'manage_proxies',
      //   amount: '0',
      //   block,
      //   date: Date.now(),
      //   fee: fee || estimatedFee?.toString(),
      //   from: String(formatted),
      //   hash: txHash || '',
      //   status: failureText || status,
      //   to: ''
      // });

      setTxInfo({
        api,
        block: block || 0,
        chain,
        from: { address: formatted, name: 'amiiir' },
        failureText,
        fee: estimatedFee || fee || '',
        status,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : null,
        txHash: txHash || ''
      });
      // eslint-disable-next-line no-void
      // void saveHistory(chain, hierarchy, formatted, history);
      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
      // setState(localState);
      // setConfirmingState('');
    }
  }, [api, chain, estimatedFee, formatted, password, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  useEffect(() => {
    const addingLength = proxies.filter((item) => item.status === 'new').length;
    const removingLength = proxies.filter((item) => item.status === 'remove').length;

    addingLength && setHelperText(t<string>(`You are adding ${addingLength} Prox${addingLength > 1 ? 'ies' : 'y'}`));
    removingLength && setHelperText(t<string>(`You are removing ${removingLength} Prox${removingLength > 1 ? 'ies' : 'y'}`));
    addingLength && removingLength && setHelperText(t<string>(`Adding ${addingLength} and removing ${removingLength} Proxies`));
  }, [proxies, t]);

  useEffect(() => {
    const toChange = proxies.filter((item) => item.status === 'remove' || item.status === 'new');

    setProxiesToChange(toChange);
  }, [proxies]);

  useEffect(() => {
    setNextButtonDisalbe(!password);
  }, [password]);

  return (
    <>
      {isPasswordError &&
        <Grid
          color='red'
          height='30px'
          m='auto'
          pt='5px'
          mb='-15px'
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
      <Typography
        m='20px auto'
        sx={{
          borderBottom: '1px solid',
          borderBottomColor: 'secondary.main'
        }}
        textAlign='center'
        width='30%'
      >
        {t<string>('Review')}
      </Typography>
      <Typography
        textAlign='center'
      >
        {helperText}
      </Typography>
      <ProxyTable
        chain={chain}
        label={t<string>('Proxies')}
        maxHeight={window.innerHeight / 3}
        mode='Status'
        proxies={proxiesToChange}
        style={{
          m: '20px auto 10px',
          width: '92%'
        }}
      />
      <Grid
        alignItems='center'
        container
        justifyContent='center'
        m='20px auto 5px'
        width='92%'
      >
        <Grid
          display='inline-flex'
          item
        >
          <Typography
            fontSize='14px'
            fontWeight={300}
            lineHeight='23px'
          >
            {t<string>('Deposit:')}
          </Typography>
          <Grid
            item
            lineHeight='22px'
            pl='5px'
          >
            <ShowBalance
              api={api}
              balance={depositValue}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Divider
          orientation='vertical'
          sx={{
            backgroundColor: 'secondary.main',
            height: '30px',
            mx: '5px',
            my: 'auto'
          }}
        />
        <Grid
          display='inline-flex'
          item
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
            <ShowBalance
              api={api}
              balance={estimatedFee}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
      </Grid>
      <PasswordWithUseProxy
        api={api}
        genesisHash={account?.genesisHash}
        isPasswordError={isPasswordError}
        label={`${t<string>('Password')} for ${selectedProxyName || account?.name}`}
        onChange={setPassword}
        proxiedAddress={address}
        proxies={proxies}
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
      />
      <PButton
        _onClick={onNext}
        disabled={nextButtonDisabe}
        text={t<string>('Next')}
      />
      {<WaitScreen show={showWaitScreen} title={t('Manage Proxies')} />}
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
            chain={chain}
            deposit={depositValue}
            name={selectedProxyName}
            proxies={proxiesToChange}
          />
        </Confirmation>
      }
    </>
  );
}
